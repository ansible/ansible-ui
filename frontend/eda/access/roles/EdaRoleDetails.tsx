import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  PageLayout,
  Scrollable,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRole } from '../../interfaces/EdaRole';

import { EdaRolePermissions } from './components/EdaRolePermissions';

export function EdaRoleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: role } = useGet<EdaRole>(edaAPI`/roles/${params.id ?? ''}/`);

  return (
    <PageLayout>
      <Scrollable>
        <PageDetails disableScroll={true}>
          <PageDetail label={t('Name')}>{role?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{role?.description || ''}</PageDetail>
          <PageDetail label={t('Created')}>
            <DateTimeCell value={role?.created_at} />
          </PageDetail>
        </PageDetails>
        <PageDetails disableScroll={true} numberOfColumns={'single'}>
          <PageDetail label={t('Permissions')}>
            <EdaRolePermissions role={role} />
          </PageDetail>
        </PageDetails>
      </Scrollable>
    </PageLayout>
  );
}
