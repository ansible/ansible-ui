import { DropdownPosition, PageSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../framework';
import { Scrollable } from '../../../framework/components/Scrollable';
import { TableDetails } from '../../../framework/PageTable/PageTableDetails';
import { useSettings } from '../../../framework/Settings';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaRule } from '../interfaces/EdaRule';
import { useRuleActions } from './hooks/useRuleActions';
import { useRuleColumns } from './hooks/useRuleColumns';

export function RuleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rule, mutate: refresh } = useGet<EdaRule>(`/api/rules/${params.id ?? ''}`);
  const settings = useSettings();
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
      <Scrollable>
        <PageSection
          variant="light"
          style={{
            backgroundColor:
              settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
          }}
        >
          <TableDetails item={rule} columns={tableColumns} />
        </PageSection>
      </Scrollable>
    </PageLayout>
  );
}
