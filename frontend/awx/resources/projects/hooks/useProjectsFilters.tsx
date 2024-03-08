import { useDynamicToolbarFilters } from '../../../access/common/useDynamicFilters';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { Project } from '../../../interfaces/Project';

export function useProjectsFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters<Project>({
    optionsPath: 'projects',
    preSortedKeys: ['name', 'id', 'status', 'scm_type', 'created-by', 'modified-by'],
    preFilledValueKeys: ['name', 'id'],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
