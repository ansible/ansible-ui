import { DropdownPosition, PageSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../framework';
import { Scrollable } from '../../../../framework/components/Scrollable';
import { TableDetails } from '../../../../framework/PageTable/PageTableDetails';
import { useSettings } from '../../../../framework/Settings';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { EdaUser } from '../../interfaces/EdaUser';
import { useUserActions } from './hooks/useUserActions';
import { useUserColumns } from './hooks/useUserColumns';

export function UserDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: User, mutate: refresh } = useGet<EdaUser>(`/api/Users/${params.id ?? ''}`);
  const settings = useSettings();
  const tableColumns = useUserColumns();
  const itemActions = useUserActions(refresh);
  return (
    <PageLayout>
      <PageHeader
        title={User?.name}
        breadcrumbs={[{ label: t('Users'), to: RouteE.EdaUsers }, { label: User?.name }]}
        headerActions={
          <PageActions<EdaUser>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={User}
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
          <TableDetails item={User} columns={tableColumns} />
        </PageSection>
      </Scrollable>
    </PageLayout>
  );
}
