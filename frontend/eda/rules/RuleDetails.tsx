import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../framework';
import { PageDetailsFromColumns } from '../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaRule } from '../interfaces/EdaRule';
import { useRuleActions } from './hooks/useRuleActions';
import { useRuleColumns } from './hooks/useRuleColumns';

export function RuleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rule, mutate: refresh } = useGet<EdaRule>(`/api/rules/${params.id ?? ''}`);
  const tableColumns = useRuleColumns();
  const itemActions = useRuleActions(refresh);
  return (
    <PageLayout>
      <PageHeader
        title={rule?.name}
        breadcrumbs={[{ label: t('Rules'), to: RouteE.EdaRules }, { label: rule?.name }]}
        headerActions={
          <PageActions<EdaRule>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={rule}
          />
        }
      />

      <PageDetailsFromColumns item={rule} columns={tableColumns} />
    </PageLayout>
  );
}
