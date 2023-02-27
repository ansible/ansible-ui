import { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import Visualizer from './Visualizer.jsx';

export function VisualizerTab(props: { template: WorkflowJobTemplate }) {
  return <Visualizer template={props.template} />;
}
