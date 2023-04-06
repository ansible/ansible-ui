import React, { FunctionComponent, useState } from 'react';
import {
  InputGroup,
  InputGroupText,
  TextInput,
  InputGroupTextVariant,
  Switch,
} from '@patternfly/react-core';
import { Tr, Td } from '@patternfly/react-table';
import { global_success_color_200 as globalSuccessColor200 } from '@patternfly/react-tokens';
import { global_disabled_color_200 as globalDisabledColor200 } from '@patternfly/react-tokens';

import currencyFormatter from '../../utilities/currencyFormatter';
import percentageFormatter from '../../utilities/percentageFormatter';
import timeFormatter from '../../utilities/timeFormatter';
import { ChartLegendEntry } from 'react-json-chart-builder';
import ExpandedRowContents from './ExpandedRowContents';
import { useTranslation } from 'react-i18next';

interface Props {
  template: ChartLegendEntry;
  readOnly: boolean;
  variableRow: { key: string; value: string };
}

const Row: FunctionComponent<Props> = ({ template, readOnly = true, variableRow }) => {
  const [isExpanded, setIsExpanded] = useState(
    window.localStorage.getItem(template.id.toString()) === 'true' || false
  );
  const expandedRow = (value: boolean, id: number) => {
    window.localStorage.setItem(id.toString(), value ? 'true' : 'false');
    setIsExpanded(value);
  };
  const { t } = useTranslation();

  const setLabeledValue = (key: string, value: number): string => {
    let label;
    switch (key) {
      case 'elapsed':
        label = timeFormatter(value) + ' seconds';
        break;
      case 'template_automation_percentage':
        label = percentageFormatter(value) + '%';
        break;
      case 'successful_hosts_savings':
      case 'failed_hosts_costs':
      case 'monetary_gain':
        label = currencyFormatter(value);
        break;
      default:
        label = (+value).toFixed(2);
    }
    return label;
  };

  return (
    <>
      <Tr>
        <Td
          expand={{
            rowIndex: parseInt(template.id.toString()),
            isExpanded: isExpanded,
            onToggle: () => expandedRow(!isExpanded, parseInt(template.id.toString())),
          }}
        />
        <Td>{template.name}</Td>
        {variableRow && <Td>{setLabeledValue(variableRow.key, +template[variableRow.key])}</Td>}
        <Td>
          <InputGroup>
            <TextInput
              autoFocus={
                window.localStorage.getItem('focused') === 'manual-time-' + template.id.toString()
              }
              id={'manual-time-' + template.id.toString()}
              data-cy={'manual-time'}
              style={{ maxWidth: '150px' }}
              type="number"
              aria-label="time run manually"
              value={template.manual_effort_minutes || 60}
              onBlur={() => window.localStorage.setItem('focused', '')}
              isDisabled={readOnly}
            />
            <InputGroupText>{t('min')}</InputGroupText>
            <InputGroupText variant={InputGroupTextVariant.plain}>
              {t(`x ${template.successful_hosts_total} host runs`)}
            </InputGroupText>
          </InputGroup>
        </Td>
        <Td
          data-cy={'savings'}
          style={{
            color: template.enabled ? globalSuccessColor200.value : globalDisabledColor200.value,
          }}
        >
          {currencyFormatter(parseInt(template.monetary_gain.toString()) || 0)}
        </Td>
        <Td>
          <Switch
            label={t('Show')}
            labelOff={t('Hide')}
            isChecked={!!template.enabled}
            isDisabled={readOnly}
          />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <ExpandedRowContents template={template} />
      </Tr>
    </>
  );
};
export default Row;
