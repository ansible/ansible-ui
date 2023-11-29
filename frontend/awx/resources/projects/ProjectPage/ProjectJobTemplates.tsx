//import { useParams } from 'react-router-dom';
//import { awxAPI } from '../../../api/awx-utils';
import { Templates } from '../../templates/Templates';

export function ProjectJobTemplates() {
  //const params = useParams<{ id: string }>();
  //return <Templates url={awxAPI`/projects/${params.id ?? ''}/job_templates/>;
  return <Templates />;
}
