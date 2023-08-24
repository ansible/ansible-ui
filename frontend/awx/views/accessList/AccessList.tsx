import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { AccessRole, User } from '../../interfaces/User';
import { useAwxView } from '../../useAwxView';
import { useAccessListFilter } from './hooks/useAccessListFilter';
import { useAccessListColumns } from './hooks/useAccessListColumns';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { CubesIcon } from '@patternfly/react-icons';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useAccessListToolbarAction } from './hooks/useAccessListToolbarAction';
import { useActiveUser } from '../../../common/useActiveUser';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useState } from 'react';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { postRequest } from '../../../common/crud/Data';

export function AccessList(props: { sublistEndpoint: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User>();
  const [role, setRole] = useState<AccessRole>();
  const toolbarFilters = useAccessListFilter();

  const tableColumns = useAccessListColumns(setIsOpen, setUser, setRole);
  const view = useAwxView<User>({
    url: props.sublistEndpoint,
    toolbarFilters,
    tableColumns,
  });

  const confirmRemoveAccess: () => Promise<void> = async () => {
    let args: { url: string; data: { disassociate: boolean; id: number } };
    if (!user?.summary_fields?.direct_access?.length) return;
    if (
      user?.summary_fields?.direct_access?.length &&
      user?.summary_fields?.direct_access[0].role?.team_id
    ) {
      // Removing access from a team
      args = {
        url: `/api/v2/teams/${user.summary_fields.direct_access[0].role.team_id}/roles/`,
        data: { disassociate: true, id: user.summary_fields.direct_access[0].role.id },
      };
    } else {
      // Removing access from a user
      args = {
        url: `/api/v2/users/${user.id}/roles/`,
        data: {
          disassociate: true,
          id: user.summary_fields.direct_access[0].role.id,
        },
      };
    }
    try {
      await postRequest(args.url, args.data);
    } catch (err) {
      //TODO: Handle error
    } finally {
      setIsOpen(false);
      await view.refresh();
    }
  };

  usePersistentFilters('access');

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(props.sublistEndpoint);
  const activeUser = useActiveUser();
  const canGrantAccess =
    Boolean(data && data.actions && data.actions['POST']) || activeUser?.is_superuser;

  const toolbarActions = useAccessListToolbarAction(
    view.unselectItemsAndRefresh,
    props.sublistEndpoint
  );
  return (
    <>
      <PageLayout>
        <PageHeader
          title={t('Access')}
          titleHelpTitle={t('Access')}
          titleHelp={t(
            'Access are used to launch jobs on a regular basis. They can be used to launch jobs against machines, synchronize with inventory sources, and import project content from a version control system.'
          )}
          titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/scheduling.html"
          description={t(
            'Access are used to launch jobs on a regular basis. They can be used to launch jobs against machines, synchronize with inventory sources, and import project content from a version control system.'
          )}
        />
        <PageTable<User>
          toolbarFilters={toolbarFilters}
          toolbarActions={toolbarActions}
          tableColumns={tableColumns}
          errorStateTitle={t('Error loading list')}
          emptyStateTitle={
            canGrantAccess
              ? t('No user has access yet except for super users')
              : t('You do not have permission to grant access to this resource')
          }
          emptyStateDescription={
            canGrantAccess
              ? t('Please grant access to this resource by using the button below.')
              : t(
                  'Please contact your organization administrator if there is an issue with your access.'
                )
          }
          emptyStateIcon={canGrantAccess ? undefined : CubesIcon}
          emptyStateButtonText={canGrantAccess ? t('Grant access') : undefined}
          emptyStateButtonClick={canGrantAccess ? () => navigate('/') : undefined}
          {...view}
        />
      </PageLayout>
      {isOpen && role && user && (
        <Modal
          titleIconVariant={'warning'}
          title={t('Remove access')}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          variant={ModalVariant.medium}
          tabIndex={0}
          actions={[
            <Button key="confirm" variant="danger" id="confirm" onClick={void confirmRemoveAccess}>
              {t('Confirm')}
            </Button>,
            <Button key="cancel" variant="link" onClick={() => setIsOpen(false)}>
              {t('Cancel')}
            </Button>,
          ]}
          hasNoBodyWrapper
        >
          <Table aria-label="Simple table">
            <Thead>
              <Tr>
                <Th>{t('Username')}</Th>
                <Th>{t('Role')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Th>{user.username}</Th>
                <Th>{role.name}</Th>
              </Tr>
            </Tbody>
          </Table>
        </Modal>
      )}
    </>
  );
}
