import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon,
  Panel as PFPanel,
  PanelMain,
  PanelMainBody,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CircleIcon,
  ClipboardCheckIcon,
  ClockIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ProcessAutomationIcon,
  ShareAltIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';

const Panel = styled(PFPanel)`
  position: absolute;
  background: --pf-v5-global--BackgroundColor--100;
  width: 240px;
  min-height: 300px;
  position: absolute;
  left: 255px;
  bottom: 60px;
  border-radius: var(--pf-v5-global--BorderRadius--sm);
  box-shadow: var(--pf-v5-global--BoxShadow--sm);
  z-index: 1;
`;

export const Legend = () => {
  const { t } = useTranslation();

  const LegendDescription = (props: { label: string; icon: ReactElement }) => {
    const { label, icon } = props;
    return (
      <div>
        <span style={{ marginRight: '10px' }}>{icon}</span>
        <span>{label}</span>
      </div>
    );
  };

  return (
    <Panel data-cy="workflow-visualizer-legend">
      <PanelMain>
        <PanelMainBody>
          <DescriptionList>
            <DescriptionListGroup data-cy="legend-node-types">
              <DescriptionListTerm>{t('Node types')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LegendDescription label={t('Job Template')} icon={<ClipboardCheckIcon />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('Workflow Template')} icon={<ShareAltIcon />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('Project Sync')} icon={<SyncAltIcon />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('Approval Node')} icon={<ClockIcon />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('Inventory Update')} icon={<ProcessAutomationIcon />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('System Job')} icon={<CogIcon />} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup data-cy="legend-node-status-types">
              <DescriptionListTerm>{t('Node status types')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Failed')}
                  icon={
                    <Icon status="danger">
                      <ExclamationCircleIcon />
                    </Icon>
                  }
                />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Warning')}
                  icon={
                    <Icon status="warning">
                      <ExclamationTriangleIcon />
                    </Icon>
                  }
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup data-cy="legend-run-status-types">
              <DescriptionListTerm>{t('Run status types')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Run on success')}
                  icon={
                    <Icon status="success">
                      <CheckCircleIcon />{' '}
                    </Icon>
                  }
                />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Run on fail')}
                  icon={
                    <Icon status="danger">
                      <ExclamationCircleIcon />
                    </Icon>
                  }
                />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Run always')}
                  icon={
                    <Icon status="info">
                      <CircleIcon />
                    </Icon>
                  }
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};
