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
    preFilledValueKeys: ['name', 'id'],
    preSortedKeys: ['name', 'id', 'status', 'scm_type', 'created-by', 'modified-by'],
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
