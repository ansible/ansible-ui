import { Button, CardActions, CardBody, CardFooter } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageDashboard, PageDashboardCard, PageHeader, PageLayout } from '../../framework';

export function Lightspeed() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader title={t(`Ansible Lightspeed with IBM watsonx Code Assistant`)} />
      <PageDashboard>
        <PageDashboardCard width="xxl">
          <CardBody>
            <p>
              {t(
                'Ansible Lightspeed with IBM watsonx Code Assistant is a new tool to help you with writing playbooks.'
              )}
            </p>
            <p>
              {t(
                'To learn more about how to get started with using Ansible Lightspeed with IBM watsonx Code Assistance, click the button below.'
              )}
            </p>
          </CardBody>
          <CardFooter>
            <CardActions>
              <Button variant="primary" icon={<ExternalLinkAltIcon />}>
                {t('Get started')}
              </Button>
            </CardActions>
          </CardFooter>
        </PageDashboardCard>
        {/* <PageDashboardCard
          title={t('Ansible Lightspeed with IBM watsonx Code Assistant')}
          linkText={<ExternalLinkAltIcon />}
          width="md"
        >
          <CardBody>
            {t('Description of Ansible Lightspeed with IBM wastonx Code Assistant')}
          </CardBody>
        </PageDashboardCard> */}
      </PageDashboard>
    </PageLayout>
  );
}
