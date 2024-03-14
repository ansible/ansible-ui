import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import { UnifiedJobTemplate } from '../../../interfaces/generated-from-swagger/api';

export function useTemplateFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters<UnifiedJobTemplate>({
    optionsPath: 'unified_job_templates',
    preSortedKeys: ['name', 'description', 'status', 'created-by', 'modified-by'],
    preFilledValueKeys: [
      {
        name: {
          resourceType: 'unified_job_templates',
          params: { order_by: '-created', type: 'job_template,workflow_job_template' },
          labelKey: 'name',
          valueKey: 'name',
        },
      },
      'id',
    ],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}

//
// {
//   key: 'organization',
//   label: 'Organization',
//   type: 'multi-select',
//   query: 'organization',
//   options: [],
// },
// {
//   key: 'project',
//   label: 'Project',
//   type: 'multi-select',
//   query: 'project',
//   options: [],
// },
// {
//   key: 'credential',
//   label: 'Credential',
//   type: 'multi-select',
//   query: 'credential',
//   options: [],
// },
// {
//   key: 'inventory',
//   label: 'Inventory',
//   type: 'multi-select',
//   query: 'inventory',
//   options: [],
// },
// {
//   key: 'job_template',
//   label: 'Job Template',
//   type: 'multi-select',
//   query: 'job_template',
//   options: [],
// },
// {
//   key: 'job_template_type',
//   label: 'Job Template Type',
//   type: 'multi-select',
//   query: 'job_template_type',
//   options: [],
// },
// {
//   key: 'job_template_project',
//   label: 'Job Template Project',
//   type: 'multi-select',
//   query: 'job_template_project',
//   options: [],
// },
// {
//   key: 'job_template_credential',
//   label: 'Job Template Credential',
//   type: 'multi-select',
//   query: 'job_template_credential',
//   options: [],
// },
// {
//   key: 'job_template_inventory',
//   label: 'Job Template Inventory',
//   type: 'multi-select',
//   query: 'job_template_inventory',
//   options: [],
// },
// {
//   key: 'job_template_job_template',
//   label: 'Job Template Job Template',
//   type: 'multi-select',
//   query: 'job_template_job_template',
//   options: [],
// },
// {
//   key: 'job_template_job_template_type',
//   label: 'Job Template Job Template Type',
//   type: 'multi-select
