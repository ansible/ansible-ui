import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../framework';
import { PageDetailsFromColumns } from '../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useRulebookActivationActions } from './hooks/useRulebookActivationActions';
import { useRulebookActivationColumns } from './hooks/useRulebookActivationColumns';

export function RulebookActivationDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rulebookActivation, mutate: refresh } = useGet<EdaRulebookActivation>(
    `/api/activation_instances/${params.id ?? ''}`
  );
  const tableColumns = useRulebookActivationColumns();
  const itemActions = useRulebookActivationActions(refresh);
  return (
    <PageLayout>
      <PageHeader
        title={rulebookActivation?.name}
        breadcrumbs={[
          { label: t('RulebookActivations'), to: RouteE.EdaRulebookActivations },
          { label: rulebookActivation?.name },
        ]}
        headerActions={
          <PageActions<EdaRulebookActivation>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={rulebookActivation}
          />
        }
      />
      <PageDetailsFromColumns item={rulebookActivation} columns={tableColumns} />
    </PageLayout>
  );
}
