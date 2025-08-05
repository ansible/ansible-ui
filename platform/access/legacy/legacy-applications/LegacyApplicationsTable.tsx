import {
  IPageAction,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import {
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '@ansible/awx-ui/common/awx-toolbar-filters';
import { useAwxActiveUser } from '@ansible/awx-ui/common/useAwxActiveUser';
import { useAwxView } from '@ansible/awx-ui/common/useAwxView';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { Alert, AlertGroup, ButtonVariant, PageSection } from '@patternfly/react-core';
import { CubesIcon, PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteLegacyApplications } from './hooks/useDeleteLegacyApplications';
import { useLegacyApplicationColumns } from './hooks/useLegacyApplicationColumns';

export function LegacyApplicationsTable() {
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const nameFilter = useNameToolbarFilter();
  const orgFilter = useOrganizationToolbarFilter();
  const toolbarFilters: IToolbarFilter[] = [nameFilter, orgFilter];
  const tableColumns = useLegacyApplicationColumns();
  const getPageUrl = useGetPageUrl();
  usePersistentFilters('applications');

  const view = useAwxView<Application>({
    url: awxAPI`/applications/`,
    toolbarFilters,
    tableColumns,
  });
  const deleteApplications = useDeleteLegacyApplications(view.unselectItemsAndRefresh);
  const pageNavigate = usePageNavigate();

  const toolbarActions = useMemo<IPageAction<Application>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create legacy application'),
        isDisabled: activeAwxUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to create a legacy application. Please contact your system administrator if there is an issue with your access.'
            ),
        href: getPageUrl(PlatformRoute.CreateLegacyApplication),
        isHidden: () => process.env.NODE_ENV !== 'development',
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete legacy applications'),
        isDisabled: activeAwxUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to delete an legacy application. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: deleteApplications,
        isDanger: true,
      },
    ],
    [t, activeAwxUser?.is_superuser, getPageUrl, deleteApplications]
  );

  const rowActions = useMemo<IPageAction<Application>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit legacy application'),
        isDisabled: activeAwxUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to edit an legacy application. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: (application) =>
          pageNavigate(PlatformRoute.EditLegacyApplication, {
            params: { applicationId: application.id },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete legacy application'),
        isDisabled: activeAwxUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to delete an legacy application. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: (application) => deleteApplications([application]),
        isDanger: true,
      },
    ],
    [t, activeAwxUser, pageNavigate, deleteApplications]
  );

  return (
    <>
      <PageSection>
        <AlertGroup>
          <Alert
            variant="warning"
            title={t(
              'Legacy applications are used for backwards compatibility with existing automation.'
            )}
            isInline
            isExpandable
          >
            {t(
              'Existing controller automation should be updated to platform automation. Legacy applications should be deleted and replaced with platform applications in the API Applications section.'
            )}
          </Alert>
        </AlertGroup>
      </PageSection>
      <PageTable<Application>
        id="platform-applications-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading legacy applications')}
        emptyState={
          process.env.NODE_ENV === 'development' ? (
            <PageTableEmptyState
              title={t('No legacy applications found')}
              description={t('No legacy applications match the filter criteria')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(PlatformRoute.CreateLegacyApplication)}
              >
                {t('Create legacy application')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('No legacy applications found')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        defaultSubtitle={t('Application')}
        {...view}
        disableListView
        disableCardView
      />
    </>
  );
}
