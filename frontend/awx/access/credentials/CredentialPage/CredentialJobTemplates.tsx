import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { TemplatesListWithDomains } from '../../../resources/templates/TemplatesListWithDomains';

export function CredentialJobTemplates() {
  const { id = '' } = useParams<{ id: string }>();
  return <TemplatesListWithDomains url={awxAPI`/job_templates/`} credentialsId={id} />;
}
