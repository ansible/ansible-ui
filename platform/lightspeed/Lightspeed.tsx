import { Button, CardBody, CardFooter, Text, TextContent } from '@patternfly/react-core';
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
            <TextContent>
              <Text component="p">
                {t(
                  'Red Hat Ansible Lightspeed with IBM watsonx Code Assistant is a generative AI service available to Red Hat Ansible Automation Platform users. Tapping into automation-specific foundation models, it uses natural language processing to turn written prompts into code snippets for the creation of Ansible playbooks.'
                )}
              </Text>
              <Text component="p">
                {t(
                  'The best part? It’s all done the Ansible way, ensuring an experience rooted in transparency, accuracy, and trust.'
                )}
              </Text>
              <Text component="p">
                {t(
                  'To learn more about how to get started with using Ansible Lightspeed with IBM watsonx Code Assistance, click the button below.'
                )}
              </Text>
            </TextContent>
          </CardBody>
          <CardFooter>
            <Button
              variant="primary"
              icon={<ExternalLinkAltIcon />}
              href="https://developers.redhat.com/products/ansible/lightspeed"
              component="a"
              target="_blank"
            >
              {t('Get started')}
            </Button>
          </CardFooter>
        </PageDashboardCard>
      </PageDashboard>
    </PageLayout>
  );
}
