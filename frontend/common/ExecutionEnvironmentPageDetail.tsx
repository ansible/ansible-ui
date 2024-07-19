import { Link } from 'react-router-dom';
import { Popover, Tooltip } from '@patternfly/react-core';
import styled from 'styled-components';
import { ExclamationTriangleIcon as PFExclamationTriangleIcon } from '@patternfly/react-icons';

import { SummaryFieldsExecutionEnvironment } from '../awx/interfaces/summary-fields/summary-fields';
import { useAwxConfig } from '../awx/common/useAwxConfig';
import { useTranslation } from 'react-i18next';
import { getDocsBaseUrl } from '../awx/common/util/getDocsBaseUrl';
import { PageDetail } from '../../framework';

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

export function ExecutionEnvironmentDetail(props: {
  executionEnvironment?: SummaryFieldsExecutionEnvironment;
  isDefaultEnvironment?: boolean;
  virtualEnvironment?: SummaryFieldsExecutionEnvironment;
  verifyMissingVirtualEnv?: boolean;
  helpText?: string;
}) {
  const config = useAwxConfig();
  const { t } = useTranslation();
  const docsLink = getDocsBaseUrl(config, 'eeMigration');
  const label = props.isDefaultEnvironment
    ? t('Default Execution Environment')
    : t('Execution Environment');

  if (props.executionEnvironment) {
    return (
      <PageDetail label={label} helpText={props.helpText}>
        <Link to={`/execution_environments/${props.executionEnvironment.id}/details`}>
          {props.executionEnvironment.name}
        </Link>
      </PageDetail>
    );
  }
  if (props.verifyMissingVirtualEnv && props.virtualEnvironment && !props.executionEnvironment) {
    return (
      <PageDetail label={label} helpText={props.helpText}>
        <>
          {t`Missing resource`}
          <span>
            <Popover
              className="missing-execution-environment"
              headerContent={<div>{t`Execution Environment Missing`}</div>}
              bodyContent={
                <div>
                  {t(`
                    Custom virtual environment {virtualEnvironment} must be replaced by an execution
                    environment. For more information about migrating to execution environments see `)}
                  <a href={docsLink} target="_blank" rel="noopener noreferrer">
                    {t('the documentation.')}
                  </a>
                </div>
              }
              position="right"
            >
              <ExclamationTrianglePopover />
            </Popover>
          </span>
        </>
      </PageDetail>
    );
  }
  if (!props.verifyMissingVirtualEnv && !props.virtualEnvironment && !props.executionEnvironment) {
    return (
      <PageDetail label={t`Execution Environment`} helpText={props.helpText}>
        <>
          {t`Missing resource`}
          <span>
            <Tooltip content={t`Execution environment is missing or deleted.`}>
              <ExclamationTriangleIcon />
            </Tooltip>
          </span>
        </>
      </PageDetail>
    );
  }

  return null;
}
