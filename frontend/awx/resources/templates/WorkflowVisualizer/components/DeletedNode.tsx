import { FC } from 'react';
import { TrashIcon } from '@patternfly/react-icons';
import { DefaultNode, WithDragNodeProps } from '@patternfly/react-topology';
import type { CustomNodeProps } from '../types';

export const DeletedNode: FC<CustomNodeProps & WithDragNodeProps> = ({ element, ...rest }) => {
  const data = element.getData();
  if (!data) return null;

  return (
    <DefaultNode element={element} labelClassName={`${data.id}-node-label`} {...rest}>
      <g transform={`translate(13, 13)`}>
        <TrashIcon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
    </DefaultNode>
  );
};
