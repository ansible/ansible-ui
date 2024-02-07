import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { TemplatesList } from '../../../resources/templates/TemplatesList';

export function CredentialJobTemplates() {
  const { id = '' } = useParams<{ id: string }>();
  return <TemplatesList url={awxAPI`/job_templates/`} credentialsId={id} />;
}
