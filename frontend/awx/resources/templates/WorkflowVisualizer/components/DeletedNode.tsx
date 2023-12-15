import { FC } from 'react';
import { TrashIcon } from '@patternfly/react-icons';
import { DefaultNode, WithDragNodeProps, WithSelectionProps } from '@patternfly/react-topology';
import type { CustomNodeProps } from '../types';

export const DeletedNode: FC<CustomNodeProps & WithDragNodeProps & WithSelectionProps> = ({
  element,
  onSelect,
  selected,
  ...rest
}) => {
  const id = element.getId();
  if (!id) return null;

  return (
    <DefaultNode
      element={element}
      labelClassName={`${id}-node-label`}
      onSelect={onSelect}
      selected={selected}
      {...rest}
    >
      <g transform={`translate(13, 13)`}>
        <TrashIcon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
    </DefaultNode>
  );
};
