import { DefaultEdge } from '@patternfly/react-topology';
import { CustomEdgeProps } from '../types';

const MeshEdge: React.FC<CustomEdgeProps> = ({ element }: CustomEdgeProps) => {
  const data = element.getData();
  return <DefaultEdge element={element} {...data} />;
};

export default MeshEdge;
