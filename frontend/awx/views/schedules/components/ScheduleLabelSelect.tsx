import { FormGroupTypeAheadMultiSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/FormGroupTypeAheadMultiSelect';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useAwxErrorMessageParser } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { Label } from '../../../interfaces/Label';
import { SchedulePromptValues } from '../types';

type LabelIdentity = {
  name: string;
  id?: number;
  organization?: number | null;
  summary_fields?: Partial<Label['summary_fields']>;
};

function labelKey(label: LabelIdentity) {
  return label.id === undefined
    ? JSON.stringify([label.name, label.organization])
    : String(label.id);
}

function displayLabels(
  labels: LabelIdentity[],
  globalName: string,
  organizations: Map<number, string>
) {
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label.name, (counts.get(label.name) ?? 0) + 1);
  const reserved = new Set(labels.map((label) => label.name));
  const displays = new Map<string, string>();
  for (const label of labels) {
    let display = label.name;
    if ((counts.get(label.name) ?? 0) > 1) {
      const organization =
        label.organization === null
          ? globalName
          : (label.summary_fields?.organization?.name ??
            organizations.get(label.organization!) ??
            String(label.organization));
      display = `${label.name} (${organization})`;
      // Literal label names and equal organization names must not collide with display proxies.
      while (reserved.has(display)) display = `${display} (${label.id ?? labelKey(label)})`;
    }
    reserved.add(display);
    displays.set(labelKey(label), display);
  }
  return displays;
}

export function ScheduleLabelSelect(
  props: Readonly<{
    organization: number | null;
    labels: SchedulePromptValues['labels'];
    onChange: (labels: SchedulePromptValues['labels']) => void;
  }>
) {
  const { t } = useTranslation();
  const parseError = useAwxErrorMessageParser();
  // ponytail: fetch all labels for this bounded selector; use server-side search if scale requires it.
  const { results, isLoading, error } = useAwxGetAllPages<Label>(awxAPI`/labels/`);
  const selected = props.labels ?? [];
  const available = (results ?? []).filter(
    (label) => props.organization !== null && label.organization === props.organization
  );
  const identities = new Map(selected.map((label) => [labelKey(label), label]));
  for (const label of available) {
    if (!identities.has(labelKey(label))) identities.set(labelKey(label), label);
  }
  const organizations = new Map(
    available.flatMap((label) =>
      label.summary_fields?.organization
        ? [[label.summary_fields.organization.id, label.summary_fields.organization.name] as const]
        : []
    )
  );
  const displays = displayLabels([...identities.values()], t('Global'), organizations);
  const byDisplay = new Map(
    [...identities.values()].map((label) => [displays.get(labelKey(label)), label])
  );
  const disabled = isLoading || !!error || !results || props.organization === null;

  return (
    <>
      <FormGroupTypeAheadMultiSelect
        label={t('Labels')}
        labelHelpTitle={t('Label availability')}
        labelHelp={t('Only labels from the selected organization are available.')}
        placeholderText={isLoading ? t('Loading...') : t('Select or create labels')}
        options={available.map((label) => {
          const display = displays.get(labelKey(label))!;
          return { value: display, label: display };
        })}
        value={selected.map((label) => ({ name: displays.get(labelKey(label)) }))}
        isSubmitting={disabled}
        onHandleSelection={({ name }) => {
          if (disabled) return;
          const label = byDisplay.get(name) ?? { name, organization: props.organization };
          if (!selected.some((item) => labelKey(item) === labelKey(label))) {
            props.onChange([...selected, label]);
          }
        }}
        onHandleClear={(chip) => {
          if (disabled) return;
          props.onChange(
            chip === undefined
              ? []
              : selected.filter((label) => displays.get(labelKey(label)) !== chip)
          );
        }}
      />
      {props.organization === null && (
        <Alert isInline variant="warning" title={t('Cannot create schedule labels')}>
          {t('The selected resource has no organization.')}
        </Alert>
      )}
      {error && (
        <Alert isInline variant="danger" title={t('Failed to load labels')}>
          {parseError(error).message}
        </Alert>
      )}
      {selected.length >= 100 && (
        <Alert
          isInline
          variant="info"
          component="span"
          title={t(
            'The API supports a maximum of 100 labels per schedule. Consider reducing the number of labels.'
          )}
        />
      )}
    </>
  );
}
