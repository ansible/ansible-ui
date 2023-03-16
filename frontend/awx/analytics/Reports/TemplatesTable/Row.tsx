import React, { FunctionComponent, useState } from 'react';
import {
  Button,
  InputGroup,
  InputGroupText,
  TextInput,
  Tooltip,
  InputGroupTextVariant,
  Switch,
  ButtonVariant,
} from '@patternfly/react-core';
import { Tr, Td } from '@patternfly/react-table';
import { global_success_color_200 as globalSuccessColor200 } from '@patternfly/react-tokens';
import { global_disabled_color_200 as globalDisabledColor200 } from '@patternfly/react-tokens';

import currencyFormatter from '../../utilities/currencyFormatter';
import timeFormatter from '../../utilities/timeFormatter';
import percentageFormatter from '../../utilities/percentageFormatter';
//import { Template } from './types';
import ExpandedRowContents from './ExplandedRowContents';

interface Props {
  template: any;//Template;
  //variableRow: { key: string; value: string };
  //setDataRunTime: (delta: number, id: number) => void;
  //setEnabled: (enabled: boolean) => void;
  //navigateToJobExplorer: (id: number) => void;
  readOnly: boolean;
}

const setLabeledValue = (key: string, value: number) => {
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

const Row: FunctionComponent<Props> = ({
  template,
  //variableRow,
  //setDataRunTime,
  //setEnabled,
  //navigateToJobExplorer,
  readOnly = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(
    window.localStorage.getItem(template.id.toString()) === 'true' || false
  );
  const expandedRow = (value: boolean, id: number) => {
    window.localStorage.setItem(id.toString(), value ? 'true' : 'false');
    setIsExpanded(value);
  };

  console.log(template);

  return (
    <>
      <Tr>
        <Td
          expand={{
            rowIndex: template.id,
            isExpanded: isExpanded,
            onToggle: () => expandedRow(!isExpanded, template.id),
          }}
        />
        <Td>
          {template.name}
        </Td>
        <Td>
          <InputGroup>
            <TextInput
              autoFocus={
                window.localStorage.getItem('focused') ===
                'manual-time-' + template.id.toString()
              }
              id={'manual-time-' + template.id.toString()}
              data-cy={'manual-time'}
              style={{ maxWidth: '150px' }}
              type="number"
              aria-label="time run manually"
              value={template.manual_effort_minutes || 60}
              onBlur={() => window.localStorage.setItem('focused', '')}
              onChange={(minutes) => {}}
              isDisabled={readOnly}
            />
            <InputGroupText>min</InputGroupText>
            <InputGroupText variant={InputGroupTextVariant.plain}>
              x {template.successful_hosts_total} host runs
            </InputGroupText>
          </InputGroup>
        </Td>
        <Td
          data-cy={'savings'}
          style={{
            color: template.enabled
              ? globalSuccessColor200.value
              : globalDisabledColor200.value,
          }}
        >
          {currencyFormatter(+template.monetary_gain)}
        </Td>
        <Td>
          <Switch
            label="Show"
            labelOff="Hide"
            isChecked={template.enabled}
            onChange={(checked) => {}}
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
