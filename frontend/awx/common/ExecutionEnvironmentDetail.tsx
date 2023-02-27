import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Popover, Tooltip } from '@patternfly/react-core';
import styled from 'styled-components';
import { ExclamationTriangleIcon as PFExclamationTriangleIcon } from '@patternfly/react-icons';
import { ExecutionEnvironment } from '../interfaces/ExecutionEnvironment';
import { PageDetail } from '../../../framework';
import { RouteObj } from '../../Routes';
import { SummaryFieldsExecutionEnvironment } from '../interfaces/summary-fields/summary-fields';

const ExclamationTriangleIcon = styled(PFExclamationTriangleIcon)`
  color: var(--pf-global--warning-color--100);
  margin-left: 18px;
  cursor: pointer;
`;

const ExclamationTrianglePopover = styled(PFExclamationTriangleIcon)`
  color: var(--pf-global--warning-color--100);
  margin-left: 18px;
  cursor: pointer;
`;

ExclamationTrianglePopover.displayName = 'ExclamationTrianglePopover';

function ExecutionEnvironmentDetail(props: {
  executionEnvironment: ExecutionEnvironment | SummaryFieldsExecutionEnvironment;
  isDefaultEnvironment: boolean;
  virtualEnvironment?: string;
  verifyMissingVirtualEnv?: boolean;
  helpText?: string;
}) {
  const {
    executionEnvironment,
    isDefaultEnvironment,
    virtualEnvironment,
    verifyMissingVirtualEnv,
    helpText,
  } = props;
  const { t } = useTranslation();
  // TODO: use config context to generate the base docs URL
  const docsBaseUrl = 'https://docs.ansible.com/automation-controller/latest';
  const docsLink = `${docsBaseUrl}/html/upgrade-migration-guide/upgrade_to_ees.html`;
  const label = isDefaultEnvironment
    ? t('Default Execution Environment')
    : t('Execution Environment');

  if (executionEnvironment) {
    return (
      <PageDetail label={label} helpText={helpText}>
        <Link
          to={RouteObj.ExecutionEnvironmentDetails.replace(
            ':id',
            executionEnvironment.id?.toString() || ''
          )}
        >
          {executionEnvironment.name}
        </Link>
      </PageDetail>
    );
  }
  if (verifyMissingVirtualEnv && virtualEnvironment && !executionEnvironment) {
    return (
      <PageDetail label={label} helpText={helpText}>
        {t`Missing resource`}
        <span>
          <Popover
            className="missing-execution-environment"
            headerContent={<div>{t`Execution Environment Missing`}</div>}
            bodyContent={
              <div>
                <Trans>
                  Custom virtual environment {virtualEnvironment} must be replaced by an execution
                  environment. For more information about migrating to execution environments see{' '}
                  <a href={docsLink} target="_blank" rel="noopener noreferrer">
                    the documentation.
                  </a>
                </Trans>
              </div>
            }
            position="right"
          >
            <ExclamationTrianglePopover />
          </Popover>
        </span>
      </PageDetail>
    );
  }
  if (!verifyMissingVirtualEnv && !virtualEnvironment && !executionEnvironment) {
    return (
      <PageDetail label={t`Execution Environment`} helpText={helpText}>
        {t`Missing resource`}
        <span>
          <Tooltip content={t`Execution environment is missing or deleted.`}>
            <ExclamationTriangleIcon />
          </Tooltip>
        </span>
      </PageDetail>
    );
  }

  return null;
}

export { ExecutionEnvironmentDetail };
