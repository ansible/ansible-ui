import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { TemplatesListWithDomains } from '../../../resources/templates/TemplatesListWithDomains';

export function ExecutionEnvironmentTemplates() {
  const { id = '' } = useParams<{ id: string }>();
  return (
    <TemplatesListWithDomains url={awxAPI`/unified_job_templates/`} executionEnvironmentId={id} />
  );
}
