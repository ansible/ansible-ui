import { FunctionComponent } from 'react';
import { DefaultEdge } from '@patternfly/react-topology';
import type { CustomEdgeProps } from '../types';

export const CustomEdge: FunctionComponent<CustomEdgeProps> = ({ element }: CustomEdgeProps) => {
  const data = element.getData();
  return <DefaultEdge element={element} {...data} />;
};
