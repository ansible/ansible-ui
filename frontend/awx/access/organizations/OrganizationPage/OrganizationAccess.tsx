/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { PageTab, PageTabs } from '../../../../../framework';
import { Organization } from '../../../interfaces/Organization';
import { AccessTable } from '../../users/Users';

/**
 * TODO: AccessTable should be replaced with ResourceAccessList component
 * and then deleted (it's no longer used anywhere else)
 */
export function OrganizationAccess(props: { organization: Organization }) {
  const { organization } = props;
  const { t } = useTranslation();
  // TODO: Utilize ResourceAccessList component
  return (
    <PageTabs>
      <PageTab label={t('Users')}>
        <AccessTable url={`/api/v2/organizations/${organization.id}/access_list/`} />
      </PageTab>
      <PageTab label={t('Teams')}>
        <AccessTable url={`/api/v2/organizations/${organization.id}/access_list/`} />
      </PageTab>
    </PageTabs>
  );
}
