import { Label, LabelGroup, PageSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  CopyCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  Scrollable,
  useGetPageUrl,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { StatusCell } from '../../../common/Status';
import { useGetItem } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { RestartPolicyEnum, Status906Enum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaExtraVarsCell } from '../components/EdaExtraVarCell';

export function RulebookActivationDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rulebookActivation } = useGetItem<EdaRulebookActivation>(
    edaAPI`/activations/`,
    params.id
  );
  const getPageUrl = useGetPageUrl();
  const restartPolicyHelpBlock = (
    <>
      <p>{t('A policy to decide when to restart a rulebook.')}</p>
      <br />
      <p>{t('Policies:')}</p>
      <p>{t('Always: restarts when a rulebook finishes.')}</p>
      <p>{t('Never: never restarts a rulebook when it finishes.')}</p>
      <p>{t('On failure: only restarts when it fails.')}</p>
    </>
  );
  if (!rulebookActivation) {
    return <LoadingPage />;
  }
  return (
    <Scrollable>
      <PageDetails
        alertPrompts={
          rulebookActivation.status === Status906Enum.Error ||
          rulebookActivation.status === Status906Enum.Failed
            ? [`${t('Rulebook Activation error: ')}${rulebookActivation?.status_message || ''}`]
            : []
        }
      >
        <PageDetail label={t('Activation ID')}>{rulebookActivation?.id || ''}</PageDetail>
        <PageDetail label={t('Name')}>{rulebookActivation?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{rulebookActivation?.description || ''}</PageDetail>
        <PageDetail
          label={t('Project')}
          helpText={t('Projects are a logical collection of rulebooks.')}
        >
          {rulebookActivation && rulebookActivation.project?.id ? (
            <Link
              to={getPageUrl(EdaRoute.ProjectPage, {
                params: { id: rulebookActivation.project.id },
              })}
            >
              {rulebookActivation?.project?.name}
            </Link>
          ) : (
            rulebookActivation?.project?.name || ''
          )}
        </PageDetail>
        <PageDetail
          label={t('Rulebook')}
          helpText={t('Rulebooks will be shown according to the project selected.')}
        >
          {rulebookActivation?.rulebook?.name || rulebookActivation?.rulebook_name || ''}
        </PageDetail>
        {rulebookActivation.sources && rulebookActivation.sources.length > 0 && (
          <PageDetail label={t('Sources(s)')}>
            <LabelGroup>
              {rulebookActivation.sources.map((source) => (
                <Label key={source?.id}>{source?.name}</Label>
              ))}
            </LabelGroup>
          </PageDetail>
        )}
        <PageDetail
          label={t('Decision environment')}
          helpText={t('Decision environments are a container image to run Ansible rulebooks.')}
        >
          {rulebookActivation && rulebookActivation?.decision_environment?.id ? (
            <Link
              to={getPageUrl(EdaRoute.DecisionEnvironmentPage, {
                params: { id: rulebookActivation?.decision_environment?.id },
              })}
            >
              {rulebookActivation?.decision_environment?.name}
            </Link>
          ) : (
            rulebookActivation?.decision_environment?.name || ''
          )}
        </PageDetail>
        <PageDetail label={t('Restart policy')} helpText={restartPolicyHelpBlock}>
          {rulebookActivation?.restart_policy
            ? restartPolicyName(rulebookActivation?.restart_policy, t)
            : ''}
        </PageDetail>
        <PageDetail label={t('Activation status')}>
          <StatusCell status={rulebookActivation?.status || ''} />
        </PageDetail>
        {rulebookActivation.status !== Status906Enum.Error &&
          rulebookActivation.status !== Status906Enum.Failed &&
          !!rulebookActivation?.status_message && (
            <PageDetail label={t('Status message')}>
              {rulebookActivation?.status_message}
            </PageDetail>
          )}
        <PageDetail label={t('Project git hash')}>
          <CopyCell text={rulebookActivation?.git_hash ?? ''} />
        </PageDetail>
        <PageDetail label={t('Number of rules')}>{rulebookActivation?.rules_count || 0}</PageDetail>
        <PageDetail label={t('Fire count')}>
          {rulebookActivation?.rules_fired_count || 0}
        </PageDetail>
        <PageDetail label={t('Last restarted')}>
          {rulebookActivation?.restarted_at
            ? formatDateString(rulebookActivation.restarted_at)
            : ''}
        </PageDetail>
        <PageDetail label={t('Restart count')}>{rulebookActivation?.restart_count || 0}</PageDetail>
        <PageDetail label={t('Created')}>
          {rulebookActivation?.created_at ? formatDateString(rulebookActivation?.created_at) : ''}
        </PageDetail>
        <LastModifiedPageDetail
          format="date-time"
          value={
            rulebookActivation?.modified_at ? formatDateString(rulebookActivation?.modified_at) : ''
          }
        />
      </PageDetails>
      {rulebookActivation?.extra_var?.id && (
        <PageSection variant="light">
          <EdaExtraVarsCell
            label={t('Variables')}
            helpText={t(
              `The variables for the rulebook are in a JSON or YAML format. The content would be equivalent to the file passed through the '--vars' flag of ansible-rulebook command.`
            )}
            id={rulebookActivation.extra_var.id}
          />
        </PageSection>
      )}
    </Scrollable>
  );
}

function restartPolicyName(policy: RestartPolicyEnum, t: (str: string) => string) {
  switch (policy) {
    case RestartPolicyEnum.OnFailure:
      return t('On failure');
    case RestartPolicyEnum.Always:
      return t('Always');
    case RestartPolicyEnum.Never:
      return t('Never');
    default:
      return capitalizeFirstLetter(policy);
  }
}
