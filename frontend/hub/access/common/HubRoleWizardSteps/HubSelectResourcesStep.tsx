import styled from 'styled-components';
import { HubRemote } from '../../../administration/remotes/Remotes';
import { Repository } from '../../../administration/repositories/Repository';
import { hubAPI, pulpAPI } from '../../../common/api/formatPath';
import { ExecutionEnvironment } from '../../../execution-environments/ExecutionEnvironment';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { useTranslation } from 'react-i18next';
import { Title } from '@patternfly/react-core';
import { useMemo } from 'react';
import { ITableColumn, IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useHubMultiSelectListView } from '../../../common/useHubMultiSelectListView';
import { HubNamespace } from '../../../namespaces/HubNamespace';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';

export type HubResourceType = HubNamespace | ExecutionEnvironment | HubRemote | Repository;

const resourceToEndpointMapping: { [key: string]: string } = {
  'galaxy.namespace': hubAPI`/_ui/v1/namespaces/`,
  'galaxy.ansiblerepository': pulpAPI`/repositories/ansible/ansible/`,
  'galaxy.containernamespace': hubAPI`/v3/plugin/execution-environments/repositories/`,
  'galaxy.collectionremote': pulpAPI`/remotes/ansible/collection/`,
};

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

/** Roles wizard step for selecting resources based on the resourceType selected */
export function HubSelectResourcesStep() {
  const { wizardData } = usePageWizard();
  const { t } = useTranslation();
  const { resourceType } = wizardData as { [key: string]: unknown };

  const resourceToTitleMapping = useMemo<{ [key: string]: string }>(() => {
    return {
      'galaxy.namespace': t('Select namespaces'),
      'galaxy.ansiblerepository': t('Select repositories'),
      'galaxy.containernamespace': t('Select execution environments'),
      'galaxy.collectionremote': t('Select remotes'),
    };
  }, [t]);
  const tableColumns = useMemo<ITableColumn<HubResourceType>[]>(
    () => [
      {
        header: t('Name'),
        type: 'text',
        value: (item: HubResourceType) => item.name,
        sort: 'name',
      },
    ],
    [t]
  );
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__contains',
        comparison: 'contains',
      },
    ],
    [t]
  );

  const view = useHubMultiSelectListView<HubResourceType>(
    {
      url: resourceToEndpointMapping[resourceType as string],
      toolbarFilters,
      tableColumns,
    },
    'resources'
  );

  return (
    <>
      <StyledTitle headingLevel="h1">{resourceToTitleMapping[resourceType as string]}</StyledTitle>
      <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        {t(
          "Choose the resources that will be receiving new roles. You'll be able to select the roles to apply in the next step. Note that the resources chosen here will receive all roles chosen in the next step."
        )}
      </h2>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        labelForSelectedItems={t('Selected')}
      />
    </>
  );
}
