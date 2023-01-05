import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../framework';
import { PageDetailsFromColumns } from '../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { useRulebookActions } from './hooks/useRulebookActions';
import { useRulebookColumns } from './hooks/useRulebookColumns';

export function RulebookDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rulebook, mutate: refresh } = useGet<EdaRulebook>(
    `/api/rulebooks/${params.id ?? ''}`
  );
  const tableColumns = useRulebookColumns();
  const itemActions = useRulebookActions(refresh);
  return (
    <PageLayout>
      <PageHeader
        title={rulebook?.name}
        breadcrumbs={[
          { label: t('Rulebooks'), to: RouteE.EdaRulebooks },
          { label: rulebook?.name },
        ]}
        headerActions={
          <PageActions<EdaRulebook>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={rulebook}
          />
        }
      />
      <PageDetailsFromColumns item={rulebook} columns={tableColumns} />
    </PageLayout>
  );
}
