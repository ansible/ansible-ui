import { LoadingPage, PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { PageFormHidden } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import {
  AwxSettingsOptionsAction,
  OptionActionsFormInput,
} from '@ansible/awx-ui/administration/settings/AwxSettingsForm';
import {
  awxSettingsExcludeKeys,
  useAwxSettingsGroups,
  useAwxSettingsGroupsBase,
} from '@ansible/awx-ui/administration/settings/useAwxSettingsGroups';
import { useRevertAllSettingsModal } from '@ansible/awx-ui/administration/settings/useRevertAllSettingsModal';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { AwxPageForm } from '@ansible/awx-ui/common/AwxPageForm';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { Button, FormGroup } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ID = 'policyascode';

export function PolicySettingsCategoryForm() {
  const { isLoading, error, groups, options } = useAwxSettingsGroups('policyascode');
  const group = groups.find((group) =>
    group.categories.some((category) => category.id === CATEGORY_ID)
  );
  const category = group?.categories.find((category) => category.id === CATEGORY_ID);
  const all = useGet<{ results: { url: string; slug: string; name: string }[] }>(
    awxAPI`/settings/policyascode/`
  );

  const categoryOptions = useMemo(() => {
    const categoryOptions: Record<string, AwxSettingsOptionsAction> = {};
    if (category && options) {
      for (const [key, value] of Object.entries(options)) {
        if (awxSettingsExcludeKeys.includes(key)) continue;
        if (category?.slugs.includes(value.category_slug)) {
          categoryOptions[key] = value;
        }
      }
    }
    return categoryOptions;
  }, [category, options]);

  const groupsBase = useAwxSettingsGroupsBase();

  if (error) return <AwxError error={error} />;
  if (isLoading || !group || !category) return <LoadingPage />;
  if (all.error) return <AwxError error={all.error} />;
  if (all.isLoading || !all.data) return <LoadingPage />;

  const title = groupsBase.find((group) => group.id === CATEGORY_ID)?.name;

  return (
    <PageLayout>
      <PageHeader title={title ?? category.name} />
      <PolicySettingsForm options={categoryOptions} data={all.data} />
    </PageLayout>
  );
}

export function PolicySettingsForm(props: {
  options: Record<string, AwxSettingsOptionsAction>;
  data: object;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const patch = usePatchRequest();
  const openRevertAllSettingsModal = useRevertAllSettingsModal();

  const onSubmit = useCallback(
    async (data: object) => {
      // Only send the data that is in the options
      const patchData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (Object.keys(props.options).includes(key)) {
          patchData[key] = value;
        }
      }
      await patch(awxAPI`/settings/policyascode/`, patchData);
      void navigate('..');
    },
    [navigate, patch, props.options]
  );

  const booleanOptions = Object.entries(props.options)
    .filter(([, option]) => option.type === 'boolean')
    .reduce<Record<string, AwxSettingsOptionsAction>>((acc, [key, option]) => {
      acc[key] = option;
      return acc;
    }, {});

  const certSubFormOptions = Object.entries(props.options)
    .filter(
      ([key]) =>
        key === 'OPA_AUTH_CLIENT_CERT' ||
        key === 'OPA_AUTH_CA_CERT' ||
        key === 'OPA_AUTH_CLIENT_KEY'
    )
    .reduce<Record<string, AwxSettingsOptionsAction>>((acc, [key, option]) => {
      acc[key] = {
        ...option,
        required: true,
      };
      return acc;
    }, {});

  const tokenSubFormOptions = Object.entries(props.options)
    .filter(([key]) => key === 'OPA_AUTH_TOKEN')
    .reduce<Record<string, AwxSettingsOptionsAction>>((acc, [key, option]) => {
      acc[key] = {
        ...option,
        required: true,
      };
      return acc;
    }, {});

  const otherOptions = Object.entries(props.options)
    .filter(
      ([key, option]) =>
        option.type !== 'boolean' &&
        key !== 'OPA_AUTH_CLIENT_CERT' &&
        key !== 'OPA_AUTH_CA_CERT' &&
        key !== 'OPA_AUTH_CLIENT_KEY' &&
        key !== 'OPA_AUTH_TOKEN'
    )
    .reduce<Record<string, AwxSettingsOptionsAction>>((acc, [key, option]) => {
      acc[key] = option;
      return acc;
    }, {});

  function getCategorySlugs(config: Record<string, AwxSettingsOptionsAction>): string[] {
    const slugs = new Set<string>();

    Object.values(config).forEach((item) => {
      const slug = item?.category_slug;
      if (slug) {
        slugs.add(slug);
      }
    });

    return Array.from(slugs);
  }

  return (
    <AwxPageForm
      defaultValue={props.data}
      submitText={t('Save')}
      onCancel={() => void navigate('..')}
      onSubmit={onSubmit}
      additionalActions={
        <Button
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            openRevertAllSettingsModal({
              categorySlugs: getCategorySlugs(props.options),
              onComplete: () => void navigate('..'),
            });
          }}
        >
          {t('Revert all to default')}
        </Button>
      }
    >
      {Object.entries(otherOptions).map(([key, option]) => (
        <OptionActionsFormInput key={key} name={key} option={option} />
      ))}
      {Object.keys(booleanOptions).length > 0 && (
        <FormGroup label={t('Options')} isStack role="group">
          {Object.entries(booleanOptions).map(([key, option]) => (
            <OptionActionsFormInput key={key} name={key} option={option} />
          ))}
        </FormGroup>
      )}
      <PageFormSection singleColumn>
        <PageFormHidden watch="OPA_AUTH_TYPE" hidden={(type: string) => type !== 'Certificate'}>
          <FormGroup label={t('Type details')} isStack role="group">
            {Object.entries(certSubFormOptions).map(([key, option]) => (
              <OptionActionsFormInput key={key} name={key} option={option} />
            ))}
          </FormGroup>
        </PageFormHidden>
      </PageFormSection>
      <PageFormHidden watch="OPA_AUTH_TYPE" hidden={(type: string) => type !== 'Token'}>
        <FormGroup label={t('Type details')} isStack role="group">
          {Object.entries(tokenSubFormOptions).map(([key, option]) => (
            <OptionActionsFormInput key={key} name={key} option={option} />
          ))}
        </FormGroup>
      </PageFormHidden>
    </AwxPageForm>
  );
}
