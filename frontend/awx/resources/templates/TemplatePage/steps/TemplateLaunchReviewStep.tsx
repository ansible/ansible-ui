import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Label, LabelGroup } from '@patternfly/react-core';
import { RouteObj } from '../../../../../common/Routes';
import { PageDetail, PageDetails } from '../../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../../framework/PageDetails/PageDetailCodeEditor';
import { CredentialLabel } from '../../../../common/CredentialLabel';
import { useGet } from '../../../../../common/crud/useGet';
import { useVerbosityString } from '../../../../common/useVerbosityString';
import { PageWizardContext } from '../../../../../../framework/PageWizard/PageWizardProvider';
import type { Credential } from '../../../../interfaces/Credential';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import type { TemplateLaunch } from '../TemplateLaunchWizard';

export function parseStringToTagArray(str: string) {
  if (str === null || str.trim().length === 0) return [];
  return str?.split(',')?.map((tag) => ({ name: tag, label: tag, value: tag }));
}

export default function TemplateLaunchReviewStep(props: { template: JobTemplate }) {
  const { template } = props;
  const { t } = useTranslation();
  const { wizardData } = useContext(PageWizardContext);

  const {
    inventory,
    credentials,
    instance_groups,
    execution_environment,
    diff_mode,
    scm_branch,
    extra_vars,
    forks,
    job_slice_count,
    job_tags,
    job_type,
    labels,
    limit,
    skip_tags,
    timeout,
    verbosity,
  } = wizardData as TemplateLaunch;

  const verbosityString = useVerbosityString(verbosity);

  const inventoryUrlPaths: { [key: string]: string } = {
    '': 'inventory',
    smart: 'smart_inventory',
    constructed: 'constructed_inventory',
  };

  return (
    <PageDetails numberOfColumns="multiple">
      <PageDetail label={t('Name')}>{template.name}</PageDetail>
      <PageDetail label={t('Job type')}>{job_type}</PageDetail>
      <PageDetail label={t('Organization')} isEmpty={!template.summary_fields.organization}>
        <Link
          to={RouteObj.OrganizationDetails.replace(
            ':id',
            template.summary_fields?.organization?.id?.toString() ?? ''
          )}
        >
          {template.summary_fields?.organization?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t`Inventory`} isEmpty={!inventory?.id}>
        <Link
          to={RouteObj.InventoryDetails.replace(
            ':inventory_type',
            inventoryUrlPaths[inventory?.kind]
          ).replace(':id', inventory?.id?.toString() ?? '')}
        >
          {inventory?.name}
        </Link>
      </PageDetail>
      {template.type === 'job_template' && (
        <PageDetail label={t`Project`} isEmpty={!template.summary_fields.project}>
          <Link
            to={RouteObj.ProjectDetails.replace(
              ':id',
              template.summary_fields?.project?.id.toString() ?? ''
            )}
          >
            {template.summary_fields.project?.name}
          </Link>
        </PageDetail>
      )}
      <PageDetail label={t`Execution environment`} isEmpty={isEmpty(execution_environment)}>
        <Link
          to={RouteObj.ExecutionEnvironmentDetails.replace(
            ':id',
            execution_environment?.id?.toString() ?? ''
          )}
        >
          {execution_environment?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Source control branch')}>{scm_branch}</PageDetail>
      {template.type === 'job_template' && (
        <PageDetail label={t('Playbook')}>{template?.playbook}</PageDetail>
      )}
      <PageDetail label={t('Credentials')} isEmpty={isEmpty(credentials)}>
        <LabelGroup>
          {credentials?.map((credential) => (
            <CredentialDetail credentialID={credential.id} key={credential.id} />
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail
        label={t`Instance groups`}
        helpText={t`The instance groups for this job template to run on.`}
        isEmpty={isEmpty(instance_groups)}
      >
        <LabelGroup>
          {instance_groups?.map((ig) => (
            <Label color="blue" key={ig.id}>
              <Link to={RouteObj.InstanceGroupDetails.replace(':id', (ig.id ?? 0).toString())}>
                {ig.name}
              </Link>
            </Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Forks')}>{forks || 0}</PageDetail>
      <PageDetail label={t('Limit')}>{limit}</PageDetail>
      <PageDetail label={t('Verbosity')}>{verbosityString}</PageDetail>
      <PageDetail label={t('Timeout')}>{timeout || 0}</PageDetail>
      <PageDetail label={t('Show changes')}>{diff_mode ? t`On` : t`Off`}</PageDetail>
      <PageDetail label={t('Job slicing')}>{job_slice_count}</PageDetail>
      <PageDetail label={t('Labels')} isEmpty={isEmpty(labels)}>
        <LabelGroup>
          {labels?.map((label) => <Label key={label.id}>{label.name}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Job tags')} isEmpty={isEmpty(job_tags)}>
        <LabelGroup>{job_tags?.map(({ name }) => <Label key={name}>{name}</Label>)}</LabelGroup>
      </PageDetail>
      <PageDetail label={t('Skip tags')} isEmpty={isEmpty(skip_tags)}>
        <LabelGroup>{skip_tags?.map(({ name }) => <Label key={name}>{name}</Label>)}</LabelGroup>
      </PageDetail>
      <PageDetailCodeEditor label={t('Extra vars')} value={extra_vars} />
    </PageDetails>
  );
}

function CredentialDetail({ credentialID }: { credentialID: number }) {
  const { data: credentialData } = useGet<Credential>(
    `/api/v2/credentials/${credentialID.toString()}/`
  );
  if (!credentialData) return null;
  return <CredentialLabel credential={credentialData} key={credentialID} />;
}

function isEmpty(value: undefined | null | object[] | object): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0 || Object.values(value).every(isEmpty);
  }
  return false;
}
