import { CardBody, ProgressStep, ProgressStepper, Stack, Text } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../framework';
import { PageDashboard } from '../../../framework/PageDashboard/PageDashboard';
import { PageDashboardCard } from '../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../Routes';
import { API_PREFIX } from '../constants';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaRuleAudit } from '../interfaces/EdaRuleAudit';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useEdaView } from '../useEventDrivenView';
import { EdaDecisionEnvironmentsCard } from './cards/EdaDecisionEnvironmentsCard';
import { EdaRecentProjectsCard } from './cards/EdaProjectsCard';
import { EdaRuleAuditCard } from './cards/EdaRuleAuditCard';
import RuleAuditChart from './cards/EdaRuleAuditChartCard';
import { EdaRulebookActivationsCard } from './cards/EdaRulebookActivationsCard';

export function EdaDashboard() {
  const { t } = useTranslation();
  const edaProjectView = useEdaView<EdaProject>({
    url: `${API_PREFIX}/projects/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
    defaultSort: 'modified_at',
    defaultSortDirection: 'desc',
  });
  const edaDecisionEnvironmentView = useEdaView<EdaDecisionEnvironment>({
    url: `${API_PREFIX}/decision-environments/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });
  const edaRuleAuditView = useEdaView<EdaRuleAudit>({
    url: `${API_PREFIX}/audit-rules/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });
  const edaRulebookActivationView = useEdaView<EdaRulebookActivation>({
    url: `${API_PREFIX}/activations/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });
  const hasProject = edaProjectView.itemCount !== 0;
  const hasDecisionEnvironment = edaDecisionEnvironmentView.itemCount !== 0;
  const hasRulebookActivation = edaRulebookActivationView.itemCount !== 0;
  const product: string = import.meta.env.VITE_PRODUCT ?? t('EDA Server');
  return (
    <>
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
                <Text>
                  {t('To learn how to get started, view the documentation, ')}
                  <Link
                    to="https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/eda-getting-started-guide/index"
                    target="_blank"
                  >
                    {t('check out our instruct guides')}
                  </Link>
                  {t(', or follow the steps below.')}
                </Text>
                <ProgressStepper>
                  <ProgressStep
                    variant={hasProject ? 'success' : 'info'}
                    description={t('Create a project.')}
                  >
                    <Link to={RouteObj.CreateEdaProject}>{t('Project')}</Link>
                  </ProgressStep>
                  <ProgressStep
                    variant={!hasProject ? 'pending' : hasDecisionEnvironment ? 'success' : 'info'}
                    description={t('Create a decision environment.')}
                  >
                    <Link to={RouteObj.EdaDecisionEnvironments}>{t('Decision Environment')}</Link>
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
                    <Link to={RouteObj.CreateEdaRulebookActivation}>
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
        <EdaDecisionEnvironmentsCard view={edaDecisionEnvironmentView} />
        <EdaRuleAuditCard view={edaRuleAuditView} />
        <EdaRulebookActivationsCard view={edaRulebookActivationView} />
      </PageDashboard>
    </>
  );
}
