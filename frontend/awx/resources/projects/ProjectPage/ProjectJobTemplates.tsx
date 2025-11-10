import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { TemplatesListWithDomains } from '../../templates/TemplatesListWithDomains';

export function ProjectJobTemplates() {
  const { id = '' } = useParams<{ id: string }>();
  return <TemplatesListWithDomains url={awxAPI`/job_templates/`} projectId={id} />;
}
