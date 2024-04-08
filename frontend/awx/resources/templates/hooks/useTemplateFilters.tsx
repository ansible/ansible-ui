import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useTemplateTypeToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useTemplateFilters({
  url,
  projectId,
  inventoryId,
  credentialsId,
  executionEnvironmentId,
}: {
  url?: string;
  projectId?: string;
  inventoryId?: string;
  credentialsId?: string;
  executionEnvironmentId?: string;
} = {}) {
  const splitUrl = url ? url.split('/') : [];
  const optionsPath = splitUrl[splitUrl.length - 2] || 'unified_job_templates';
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const typeToolbarFilter = useTemplateTypeToolbarFilter();
  const getQueryParams = (
    projectId?: string,
    inventoryId?: string,
    credentialsId?: string,
    executionEnvironmentId?: string
  ) => {
    const templateQueryParams: { [key: string]: string } = {
      type: 'job_template,workflow_job_template',
    };
    if (projectId) {
      templateQueryParams.project__id = projectId;
    }
    if (inventoryId) {
      templateQueryParams.inventory__id = inventoryId;
    }
    if (credentialsId) {
      templateQueryParams.credentials__id = credentialsId;
    }
    if (executionEnvironmentId) {
      templateQueryParams.execution_environment__id = executionEnvironmentId;
    }
    return templateQueryParams;
  };
  const queryParams = getQueryParams(projectId, inventoryId, credentialsId, executionEnvironmentId);
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: optionsPath,
    preSortedKeys: ['name', 'description', 'status', 'created-by', 'modified-by', 'type-templates'],
    preFilledValueKeys: {
      name: {
        apiPath: optionsPath,
        queryParams: queryParams,
      },
      id: {
        apiPath: optionsPath,
        queryParams: queryParams,
      },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter, typeToolbarFilter],
    removeFilters: ['type'], // Remove the default type filter provided by API as it gives additional types that are not applicable to the Templates list view
  });
  return toolbarFilters;
}
