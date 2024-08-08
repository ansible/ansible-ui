import { Popover, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon as PFExclamationTriangleIcon } from '@patternfly/react-icons';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PageDetail, useGetPageUrl } from '../../../framework';
import { ExecutionEnvironment } from '../interfaces/ExecutionEnvironment';
import { SummaryFieldsExecutionEnvironment } from '../interfaces/summary-fields/summary-fields';
import { AwxRoute } from '../main/AwxRoutes';
import { useAwxConfig } from './useAwxConfig';
import { useGetDocsUrl } from './util/useGetDocsUrl';

const ExclamationTriangleIcon = styled(PFExclamationTriangleIcon)`
  color: var(--pf-v5-global--warning-color--100);
  margin-left: 18px;
  cursor: pointer;
`;

const ExclamationTrianglePopover = styled(PFExclamationTriangleIcon)`
  color: var(--pf-v5-global--warning-color--100);
  margin-left: 18px;
  cursor: pointer;
`;

ExclamationTrianglePopover.displayName = 'ExclamationTrianglePopover';

function ExecutionEnvironmentDetail(props: {
  executionEnvironment: ExecutionEnvironment | SummaryFieldsExecutionEnvironment | undefined;
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
  const config = useAwxConfig();
  const docsLink = useGetDocsUrl(config, 'eeMigration');
  const label = isDefaultEnvironment
    ? t('Default execution environment')
    : t('Execution environment');
  const getPageUrl = useGetPageUrl();

  if (executionEnvironment) {
    return (
      <PageDetail label={label} helpText={helpText}>
        <Link
          to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
            params: { id: executionEnvironment.id },
          })}
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
            headerContent={<div>{t`Execution environment missing`}</div>}
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
      <PageDetail label={t`Execution environment`} helpText={helpText}>
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
