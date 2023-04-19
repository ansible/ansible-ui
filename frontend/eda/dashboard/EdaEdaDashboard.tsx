/* eslint-disable i18next/no-literal-string */
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
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useEdaView } from '../useEventDrivenView';
import { EdaDecisionEnvironmentsCard } from './cards/EdaDecisionEnvironmentsCard';
import { EdaRecentProjectsCard } from './cards/EdaRecentProjectsCard';
import RuleAuditChart from './cards/EdaRuleAuditChartCard';
import { EdaRulebookActivationsCard } from './cards/EdaRulebookActivationsCard';

export default function EdaDashboard() {
  const { t } = useTranslation();
  const edaProjectView = useEdaView<EdaProject>({
    url: `${API_PREFIX}/projects/`,
    disableQueryString: true,
    defaultSort: 'modified_at',
    defaultSortDirection: 'desc',
  });
  const edaDecisionEnvironmentView = useEdaView<EdaDecisionEnvironment>({
    url: `${API_PREFIX}/decision-environments/`,
    disableQueryString: true,
  });
  const edaRulebookActivationView = useEdaView<EdaRulebookActivation>({
    url: `${API_PREFIX}/activations/`,
    disableQueryString: true,
  });
  const hasProjectOrDecisionEnvironment =
    edaProjectView.itemCount !== 0 || edaDecisionEnvironmentView.itemCount !== 0;
  const hasRulebookActivation = edaRulebookActivationView.itemCount !== 0;

  return (
    <>
      <PageHeader
        title={t('Welcome to EDA Server')}
        description={t(
          'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
        )}
      />
      <PageDashboard>
        {(!hasProjectOrDecisionEnvironment || !hasRulebookActivation) && (
          <PageDashboardCard
            title={t('Getting started')}
            description={t(
              'Event-Driven Ansible is a highly scalable, flexible automation capability that works with event sources such as other software vendors’  monitoring tools. In an automatic remediation use case, these vendor tools watch your IT solutions and identify “events,” such as an outage.'
            )}
            width="xxl"
          >
            <CardBody>
              <Stack hasGutter>
                <Text>
                  To learn how to get started, view the documentation,{' '}
                  <Link to="https://www.redhat.com/en/engage/event-driven-ansible-20220907">
                    check out our instruct guides
                  </Link>
                  , or follow the steps below.
                </Text>
                <ProgressStepper>
                  <ProgressStep
                    variant={hasProjectOrDecisionEnvironment ? 'success' : 'info'}
                    description="Create a project or sync a decision environment."
                  >
                    <Link to={RouteObj.CreateEdaProject}>Create a project</Link> or{' '}
                    <Link to={RouteObj.EdaDecisionEnvironments}>sync a decision environment.</Link>
                  </ProgressStep>
                  <ProgressStep
                    variant={hasRulebookActivation ? 'success' : 'info'}
                    description="Create a rulebook activation."
                  >
                    <Link to={RouteObj.CreateEdaRulebookActivation}>Rulebook activation</Link>
                  </ProgressStep>
                </ProgressStepper>
              </Stack>
            </CardBody>
          </PageDashboardCard>
        )}
        <RuleAuditChart />
        <EdaRecentProjectsCard view={edaProjectView} />
        <EdaDecisionEnvironmentsCard view={edaDecisionEnvironmentView} />
        <EdaRulebookActivationsCard view={edaRulebookActivationView} />
      </PageDashboard>
    </>
  );
}
