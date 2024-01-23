import { ChartLegendEntry } from '@ansible/react-json-chart-builder';
import {
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import {
  global_disabled_color_200 as globalDisabledColor200,
  global_success_color_200 as globalSuccessColor200,
} from '@patternfly/react-tokens';
import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currencyFormatter } from '../../utilities/currencyFormatter';
import { numberFormatter } from '../../utilities/numberFormatter';
import { ExpandedRowContents } from './ExpandedRowContents';

interface Props {
  template: ChartLegendEntry;
  readOnly: boolean;
  variableRow: { key: string; value: string };
}

export const Row: FunctionComponent<Props> = ({ template, readOnly = true, variableRow }) => {
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
        label = numberFormatter(value) + ' seconds';
        break;
      case 'template_automation_percentage':
        label = numberFormatter(value) + '%';
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
            <InputGroupItem isFill>
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
            </InputGroupItem>
            <InputGroupText>{t('min')}</InputGroupText>
            <InputGroupText>{t(`x ${template.successful_hosts_total} host runs`)}</InputGroupText>
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
