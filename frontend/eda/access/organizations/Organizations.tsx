import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { EdaOrganization } from '../../interfaces/EdaOrganization';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteOrganizations } from './hooks/useDeleteOrganizations';
import { useEdaView } from '../../common/useEventDrivenView';
import { edaAPI } from '../../common/eda-utils';
import { useOrganizationsFilters } from './hooks/useOrganizationsFilters';
import { useOrganizationColumns } from './hooks/useOrganizationColumns';

export function Organizations() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('EDA');
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  usePersistentFilters('organizations');
  const toolbarFilters = useOrganizationsFilters();

  const tableColumns = useOrganizationColumns();

  const view = useEdaView<EdaOrganization>({
    url: edaAPI`/organizations/`,
    toolbarFilters,
    tableColumns,
  });

  const deleteOrganizations = useDeleteOrganizations(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<EdaOrganization>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Create organization'),
        href: getPageUrl(EdaRoute.CreateOrganization),
      },
      { type: PageActionType.Seperator },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete organizations'),
        onClick: deleteOrganizations,
        isDanger: true,
      },
    ],
    [t, getPageUrl, deleteOrganizations]
  );

  const rowActions = useMemo<IPageAction<EdaOrganization>[]>(() => {
    const actions: IPageAction<EdaOrganization>[] = [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit organization'),
        href: (organization) => {
          return getPageUrl(EdaRoute.EditOrganization, { params: { id: organization.id } });
        },
      },
      { type: PageActionType.Seperator },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete organization'),
        onClick: (organization) => deleteOrganizations([organization]),
        isDanger: true,
      },
    ];
    return actions;
  }, [t, getPageUrl, deleteOrganizations]);

  return (
    <PageLayout>
      <PageHeader
        title={t('Organizations')}
        titleHelpTitle={t('Organizations')}
        titleHelp={t(
          `An Organization is a logical collection of Users, Teams and Projects and is the highest level in the {{product}} object hierarchy.`,
          { product }
        )}
        description={t(
          `An Organization is a logical collection of Users, Teams and Projects and is the highest level in the {{product}} object hierarchy.`,
          { product }
        )}
      />
      <PageTable<EdaOrganization>
        id="eda-organizations-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading organizations')}
        emptyStateTitle={t('There are currently no organizations created.')}
        emptyStateDescription={t('Please create an organization by using the button below.')}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create organization')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateOrganization)}
        {...view}
        defaultSubtitle={t('Organization')}
      />
    </PageLayout>
  );
}
