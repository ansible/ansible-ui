import { useParams } from 'react-router-dom';
//import { Templates } from '../../templates/Templates';
import { awxAPI } from '../../../api/awx-utils';
import { TemplatesList } from '../../templates/TemplatesList';

export function ProjectJobTemplates() {
  const { id = '' } = useParams<{ id: string }>();
  return <TemplatesList url={awxAPI`/projects/${id}/job_templates`} />;
}
