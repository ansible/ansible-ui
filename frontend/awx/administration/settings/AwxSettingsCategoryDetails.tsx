import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon } from '@patternfly/react-icons';
import { t } from 'i18next';
import jsyaml from 'js-yaml';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsOptionsAction } from './AwxSettingsForm';
import { useAwxSettingsGroups, useAwxSettingsGroupsBase } from './useAwxSettingsGroups';

export function AwxSettingsCategoryDetailsPage(props: { categoryId: string }) {
  const { isLoading, error, groups, options } = useAwxSettingsGroups();
  const { categoryId } = props;
  const group = groups.find((group) =>
    group.categories.some((category) => category.id === categoryId)
  );
  const category = group?.categories.find((category) => category.id === categoryId);
  const all = useGet<{ results: { url: string; slug: string; name: string }[] }>(
    awxAPI`/settings/all/`
  );
  const { t } = useTranslation();
  const navigate = useNavigate();

  const categoryOptions = useMemo(() => {
    const categoryOptions: Record<string, AwxSettingsOptionsAction> = {};
    if (category && options) {
      for (const [key, value] of Object.entries(options)) {
        if (category?.slugs.includes(value.category_slug)) {
          categoryOptions[key] = value;
        }
      }
    }
    return categoryOptions;
  }, [category, options]);

  const groupsBase = useAwxSettingsGroupsBase();

  const actions = useMemo<IPageAction<object>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PencilAltIcon,
        label: t('Edit'),
        onClick: () => navigate('./edit', { replace: true }),
        isPinned: true,
      },
    ],
    [navigate, t]
  );

  if (error) return <AwxError error={error} />;
  if (isLoading || !group || !category) return <LoadingPage />;
  if (all.error) return <AwxError error={all.error} />;
  if (all.isLoading || !all.data) return <LoadingPage />;

  const title = groupsBase.find((group) => group.id === categoryId)?.name;

  return (
    <PageLayout>
      <PageHeader
        title={title ?? category.name}
        headerActions={<PageActions actions={actions} position={DropdownPosition.right} />}
      />
      <AwxSettingsCategoryDetails options={categoryOptions} data={all.data} />
    </PageLayout>
  );
}

export function AwxSettingsCategoryDetails(props: {
  options: Record<string, AwxSettingsOptionsAction>;
  data: Record<string, unknown>;
}) {
  return (
    <PageDetails>
      {Object.entries(props.options).map(([key, option]) => (
        <AwxSettingsCategoryDetail key={key} option={option} data={props.data} name={key} />
      ))}
    </PageDetails>
  );
}

export function AwxSettingsCategoryDetail(props: {
  option: AwxSettingsOptionsAction;
  name: string;
  data: Record<string, unknown>;
}) {
  const option = props.option;
  switch (option.type) {
    case 'string':
    case 'field':
      return <PageDetail label={option.label}>{props.data[props.name] as string}</PageDetail>;
    case 'integer':
      return <PageDetail label={option.label}>{props.data[props.name] as number}</PageDetail>;

    case 'boolean':
      return (
        <PageDetail label={option.label}>
          {props.data[props.name] ? t('Enabled') : t('Disabled')}
        </PageDetail>
      );

    case 'list':
      if ((props.data[props.name] as string[]).length === 0) return null;
      return (
        <PageDetail label={option.label}>
          {(props.data[props.name] as string[]).map((line, index) => {
            return <div key={index}>{line}</div>;
          })}
        </PageDetail>
      );

    case 'nested object':
      if (Object.keys(props.data[props.name] as object).length === 0) return null;
      return (
        <PageDetail label={option.label}>
          <pre>{jsyaml.dump(props.data[props.name])}</pre>
        </PageDetail>
      );

    case 'certificate':
      return (
        <div style={{ color: 'red' }}>
          <PageDetail label={option.label}>{option.type}</PageDetail>
        </div>
      );

    case 'choice': {
      const selected = option.choices.find((choice) => {
        if (choice[0] === props.data[props.name]) return true;
        if (!props.data[props.name] && choice[0] === '') return true;
        return false;
      });
      return <PageDetail label={option.label}>{selected?.[1]}</PageDetail>;
    }

    case 'datetime':
      if (!props.data[props.name]) return null;
      return (
        <PageDetail label={option.label}>
          {new Date(props.data[props.name] as number).toLocaleDateString()} &nbsp;
          {new Date(props.data[props.name] as number).toLocaleTimeString()}
        </PageDetail>
      );

    default:
      return <pre style={{ color: 'red' }}>{JSON.stringify(option, null, 2)}</pre>;
  }
}
