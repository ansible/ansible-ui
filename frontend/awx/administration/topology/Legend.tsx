import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Panel as PFPanel,
  PanelMain,
  PanelMainBody,
} from '@patternfly/react-core';
import {
  AddCircleOIcon,
  AnsibeTowerIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  RegionsIcon,
  ServerIcon,
} from '@patternfly/react-icons';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { pfDanger, pfDisabled, pfInfo, pfSuccess } from '../../../../framework';

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
    <Panel data-cy="mesh-viz-legend">
      <PanelMain tabIndex={0}>
        <PanelMainBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Node types')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LegendDescription label={t('Control')} icon={<RegionsIcon />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('Execution')} icon={<AnsibeTowerIcon />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('Hybrid')} icon={<ServerIcon />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('Hop')} icon={<EllipsisHIcon />} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Node status')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Ready')}
                  icon={<CheckCircleIcon color={pfSuccess} />}
                />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Provisioning')}
                  icon={<AddCircleOIcon color={pfDisabled} />}
                />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Deprovisioning')}
                  icon={<MinusCircleIcon color={pfDisabled} />}
                />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription label={t('Installed')} icon={<ClockIcon color={pfInfo} />} />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Error')}
                  icon={<ExclamationCircleIcon color={pfDanger} />}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Link status')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Established')}
                  icon={
                    <svg width="20" height="15" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="9" x2="20" y2="9" stroke={pfDisabled} strokeWidth="4" />
                    </svg>
                  }
                />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Adding')}
                  icon={
                    <svg width="20" height="15" xmlns="http://www.w3.org/2000/svg">
                      <line
                        x1="0"
                        y1="9"
                        x2="20"
                        y2="9"
                        stroke={pfSuccess}
                        strokeWidth="4"
                        strokeDasharray="6"
                      />
                    </svg>
                  }
                />
              </DescriptionListDescription>
              <DescriptionListDescription>
                <LegendDescription
                  label={t('Removing')}
                  icon={
                    <svg width="20" height="15" xmlns="http://www.w3.org/2000/svg">
                      <line
                        x1="0"
                        y1="9"
                        x2="20"
                        y2="9"
                        stroke={pfDanger}
                        strokeWidth="4"
                        strokeDasharray="6"
                      />
                    </svg>
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
