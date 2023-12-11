import { DetailInfo } from '../../../../framework/components/DetailInfo';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';
//import { useGet } from '../../../common/crud/useGet';
import { usePulpView } from '../../usePulpView';
import { pulpAPI } from '../../api/formatPath';

export function CollectionDistributions() {
  const { t } = useTranslation();
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();

  //const { data, error, refresh} =  useGet('/distributions/ansible/ansible/', { 'repository' : collection.repository?.pulp_href || '' });

  debugger;

  const view = usePulpView<Distribution>({
    url : pulpAPI`/distributions/ansible/ansible/`,
    keyFn : (item) => item.base_path,
  });

  return <DetailInfo title={t('This page is under construction')} />;
}

interface Distribution
{
  name : string,
  pulp_href : string,
  base_path : string,
  pulp_created : string,
}
