import { useState, useEffect, useMemo } from 'react';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
  SelectGroup,
  SelectList,
} from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { stringIsUUID } from '../../common/util/strings';
import { jobPaths } from './WorkflowOutput/WorkflowOutputNode';
import type { WorkflowJobNode } from '../../interfaces/WorkflowNode';

interface WorkflowOutputNavigationProps {
  workflowNodes: WorkflowJobNode[];
}

export function WorkflowOutputNavigation(props: WorkflowOutputNavigationProps) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | undefined>();
  const [filteredNodes, setFilteredNodes] = useState<WorkflowJobNode[]>([]);

  const { workflowNodes } = props;

  const relevantResults = workflowNodes.filter(
    ({ job, summary_fields }) =>
      job && job.toString() !== id && summary_fields?.job?.type !== 'workflow_approval'
  );

  useEffect(() => {
    setFilteredNodes(relevantResults);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowNodes]);

  const totalResults = relevantResults?.length || 0;

  const statuses: Record<string, string[]> = useMemo(
    () => ({
      failed: ['error', 'failed'],
      successful: ['successful'],
    }),
    []
  );

  const flatStatuses = useMemo(
    () => Object.values(statuses).reduce((acc, cur) => [...acc, ...cur], []),
    [statuses]
  );

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (event: React.MouseEvent | undefined, v: string | number | undefined) => {
    if (typeof v === 'undefined') return;

    const value = v.toString();

    if (value === selected) {
      setSelected(undefined);
      setFilteredNodes(relevantResults);
    } else {
      setSelected(value);

      if (!flatStatuses.includes(value)) return;

      setFilteredNodes(
        workflowNodes.filter(
          (node) =>
            node.summary_fields?.job?.status &&
            statuses[value].includes(node.summary_fields?.job?.status) &&
            node.job?.toString() !== id
        )
      );
    }
  };

  const Toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: '180px',
        } as React.CSSProperties
      }
    >
      {t(`Workflow jobs 1/{{totalResults}}`, { totalResults })}
    </MenuToggle>
  );

  return (
    <Select
      id="select-workflow-navigation"
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={Toggle}
      shouldFocusToggleOnSelect
    >
      <SelectGroup label={t`Workflow statuses`} key="workflow-status" data-cy="workflow-status">
        <SelectList>
          <SelectOption value="failed" key="failed" description={t`Filter by failed jobs`}>
            {t`Failed`}
          </SelectOption>
          <SelectOption
            value={'successful'}
            key="successful"
            description={t`Filter by successful jobs`}
          >
            {t`Successful`}
          </SelectOption>
        </SelectList>
      </SelectGroup>
      <SelectGroup label={t`Workflow nodes`} key="workflow-nodes" data-cy="workflow-nodes">
        <SelectList>
          {filteredNodes?.map((node: WorkflowJobNode) => (
            <SelectOption
              key={node.id}
              to={
                node.summary_fields.job?.type &&
                `/jobs/${jobPaths[node.summary_fields.job?.type]}/${
                  node.summary_fields.job?.id
                }/output`
              }
              component={Link}
              value={node.summary_fields?.job?.name}
            >
              {stringIsUUID(node.identifier) ? node.summary_fields?.job?.name : node.identifier}
            </SelectOption>
          ))}
        </SelectList>
      </SelectGroup>
    </Select>
  );
}
