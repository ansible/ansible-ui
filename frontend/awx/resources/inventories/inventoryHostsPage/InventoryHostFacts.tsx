import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetails } from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';

export function InventoryHostFacts(props: { page: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const { data: facts } = useGet<object>(
    awxAPI`/hosts/${props.page === 'host' ? params.id ?? '' : params.host_id ?? ''}/ansible_facts`
  );

  return (
    <PageDetails>
      <PageDetailCodeEditor label={t('Facts')} value={JSON.stringify(facts) || '{}'} />
    </PageDetails>
  );
}
