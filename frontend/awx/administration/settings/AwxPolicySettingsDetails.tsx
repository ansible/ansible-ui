import {
  IPageAction,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
} from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsOptionsAction } from './AwxSettingsForm';
import { useAwxSettingsGroups, useAwxSettingsGroupsBase } from './useAwxSettingsGroups';
import { AwxSettingsCategoryDetails } from './AwxSettingsCategoryDetails';

const CATEGORY_ID = 'policyascode';
const DYNAMIC_FIELDS: Record<string, string> = {
  OPA_AUTH_TOKEN: 'Token',
  OPA_AUTH_CLIENT_CERT: 'Certificate',
  OPA_AUTH_CLIENT_KEY: 'Certificate',
  OPA_AUTH_CA_CERT: 'Certificate',
};
const DATA_FIELDS = ['OPA_AUTH_CLIENT_CERT', 'OPA_AUTH_CLIENT_KEY', 'OPA_AUTH_CA_CERT'];

export function AwxPolicySettingsDetailsPage() {
  const { isLoading, error, groups, options } = useAwxSettingsGroups(CATEGORY_ID);
  const group = groups.find((group) =>
    group.categories.some((category) => category.id === CATEGORY_ID)
  );
  const category = group?.categories.find((category) => category.id === CATEGORY_ID);
  const response = useGet<Record<string, string | number | boolean>>(
    awxAPI`/settings/policyascode/`
  );
  const { t } = useTranslation();
  const navigate = useNavigate();

  const categoryOptions = useMemo(() => {
    const categoryOptions: Record<string, AwxSettingsOptionsAction> = {};
    const dynamicOptions: Record<string, AwxSettingsOptionsAction> = {};
    if (category && options) {
      for (const [key, value] of Object.entries(options)) {
        if (!Object.keys(DYNAMIC_FIELDS).includes(key)) {
          categoryOptions[key] = value;
        } else if (response.data?.OPA_AUTH_TYPE === DYNAMIC_FIELDS[key]) {
          // include dynamic fields if corresponding auth type is selected
          dynamicOptions[key] = value;
        }
      }
    }

    const merged = {
      ...categoryOptions,
      ...dynamicOptions,
    };
    for (const key of DATA_FIELDS) {
      if (merged[key]) {
        merged[key].type = 'data';
      }
    }
    return merged;
  }, [category, options, response.data?.OPA_AUTH_TYPE]);

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
  if (response.error) return <AwxError error={response.error} />;
  if (response.isLoading || !response.data) return <LoadingPage />;

  const title = groupsBase.find((group) => group.id === CATEGORY_ID)?.name;

  return (
    <PageLayout>
      <PageHeader
        title={title ?? category.name}
        headerActions={<PageActions actions={actions} position={'right'} />}
      />
      <AwxSettingsCategoryDetails options={categoryOptions} data={response.data} />
    </PageLayout>
  );
}
