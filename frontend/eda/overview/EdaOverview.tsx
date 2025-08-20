import { PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageDashboard } from '@ansible/ansible-ui-framework/PageDashboard/PageDashboard';
import { PageDashboardCard } from '@ansible/ansible-ui-framework/PageDashboard/PageDashboardCard';
import { ExternalLink } from '@ansible/hub-ui/common/ExternalLink';
import { CardBody, Content, ProgressStep, ProgressStepper, Stack } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { EdaRoute } from '../main/EdaRoutes';
import { EdaDecisionEnvironmentsCard } from './cards/EdaDecisionEnvironmentsCard';
import { EdaRecentProjectsCard } from './cards/EdaProjectsCard';
import { EdaRuleAuditCard } from './cards/EdaRuleAuditCard';
import { RuleAuditChart } from './cards/EdaRuleAuditChartCard';
import { EdaRulebookActivationsCard } from './cards/EdaRulebookActivationsCard';

export function EdaOverview() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const edaProjectView = useEdaView<EdaProject>({
    url: edaAPI`/projects/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
    defaultSort: 'modified_at',
    defaultSortDirection: 'desc',
  });
  const edaDecisionEnvironmentView = useEdaView<EdaDecisionEnvironment>({
    url: edaAPI`/decision-environments/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });
  const edaRulebookActivationView = useEdaView<EdaRulebookActivation>({
    url: edaAPI`/activations/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });
  const hasProject = edaProjectView.itemCount !== 0;
  const hasDecisionEnvironment = edaDecisionEnvironmentView.itemCount !== 0;
  const hasRulebookActivation = edaRulebookActivationView.itemCount !== 0;
  const product: string = process.env.PRODUCT ?? t('EDA Server');
  return (
    <PageLayout>
      <PageHeader
        title={t(`Welcome to {{product}}`, { product })}
        description={t(
          'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
        )}
      />
      <PageDashboard>
        {(!hasProject || !hasRulebookActivation) && (
          <PageDashboardCard
            title={t('Getting Started')}
            description={t(
              'Event-Driven Ansible is a highly scalable, flexible automation capability that works with event sources such as other software vendors’  monitoring tools. In an automatic remediation use case, these vendor tools watch your IT solutions and identify “events,” such as an outage.'
            )}
            width="xxl"
          >
            <CardBody>
              <Stack hasGutter>
                <Content component="p">
                  {t('To learn how to get started, ')}
                  <ExternalLink href="https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/eda-getting-started-guide/index">
                    {t`Documentation.`}
                  </ExternalLink>
                  <ExternalLink href="https://www.redhat.com/en/engage/event-driven-ansible-20220907">
                    {t('check out our instruct guides')}
                  </ExternalLink>
                  <>
                    {t(', or follow the steps below.')} <ExternalLinkAltIcon />
                  </>
                </Content>
                <ProgressStepper>
                  <ProgressStep
                    variant={hasProject ? 'success' : 'info'}
                    description={t('Create a project.')}
                  >
                    <Link to={getPageUrl(EdaRoute.CreateProject)}>{t('Project')}</Link>
                  </ProgressStep>
                  <ProgressStep
                    variant={!hasProject ? 'pending' : hasDecisionEnvironment ? 'success' : 'info'}
                    description={t('Create a decision environment.')}
                  >
                    <Link to={getPageUrl(EdaRoute.DecisionEnvironments)}>
                      {t('Decision Environment')}
                    </Link>
                  </ProgressStep>
                  <ProgressStep
                    variant={
                      !hasProject || !hasDecisionEnvironment
                        ? 'pending'
                        : hasRulebookActivation
                          ? 'success'
                          : 'info'
                    }
                    description={t('Create a rulebook activation.')}
                  >
                    <Link to={getPageUrl(EdaRoute.CreateRulebookActivation)}>
                      {t('Rulebook Activation')}
                    </Link>
                  </ProgressStep>
                </ProgressStepper>
              </Stack>
            </CardBody>
          </PageDashboardCard>
        )}
        <RuleAuditChart />
        <EdaRecentProjectsCard view={edaProjectView} />
        <EdaDecisionEnvironmentsCard />
        <EdaRulebookActivationsCard />
        <EdaRuleAuditCard />
      </PageDashboard>
    </PageLayout>
  );
}
