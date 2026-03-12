import { Button, Flex, FlexItem, Switch } from '@patternfly/react-core';
import React from 'react';
import { DashboardTableInputField } from './DashboardTableInputField';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { useTranslation } from 'react-i18next';
import { DashboardTableToolbarProps } from '../types';
import { ITemplateOptions } from '../interfaces';

export function DashboardTableToolbarRow(props: DashboardTableToolbarProps) {
  const { toolbarState, setToolbarState, isLoading, itemCount, onExportCsv } = props;
  const { t } = useTranslation();
  const switchID = 'switch-time-taken-automation';

  const toolbarChangeHandler = <K extends keyof ITemplateOptions>(
    value: ITemplateOptions[K],
    key: K
  ): void => {
    setToolbarState((currentData: ITemplateOptions) => ({
      ...currentData,
      [key]: value,
    }));
  };

  const exportCSV = () => onExportCsv?.();

  return (
    <Flex
      style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
      direction={{ default: 'row' }}
      alignItems={{ default: 'alignItemsCenter' }}
    >
      <FlexItem>
        <DashboardTableInputField
          label={t('Average cost of per hour to manually run the job')}
          labelHelp={t(
            'Please enter an average cost per hour for the engineer manually running jobs'
          )}
          id={`cost_manual_automation_input`}
          currentValue={toolbarState?.manual_cost_automation_per_hour}
          min={1}
          max={1000000}
          onBlur={(value: number) => toolbarChangeHandler(value, 'manual_cost_automation_per_hour')}
        ></DashboardTableInputField>
      </FlexItem>
      <FlexItem>
        <DashboardTableInputField
          label={t('Average cost per minute of running on AAP')}
          labelHelp={t(
            'Please enter an average cost per minute of running a job in the Ansible Automation Platform'
          )}
          id={`cost_automated_execution`}
          currentValue={toolbarState?.automated_process_cost_per_minute}
          min={1}
          max={1000000}
          onBlur={(value: number) =>
            toolbarChangeHandler(value, 'automated_process_cost_per_minute')
          }
        ></DashboardTableInputField>
      </FlexItem>
      <FlexItem>
        <PageFormGroup
          fieldId={switchID}
          data-testid={switchID + '-form-group'}
          label={t('Include time taken to create automation into calculation')}
        >
          <Switch
            id={switchID + '-toggle'}
            data-testid={switchID + '-toggle'}
            aria-label={t('Include time taken to create automation into calculation')}
            isChecked={toolbarState?.enable_template_creation_time === true}
            onChange={(_e, value) => toolbarChangeHandler(value, 'enable_template_creation_time')}
          />
        </PageFormGroup>
      </FlexItem>
      <FlexItem style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
        <Button
          id={'btn-export-csv'}
          data-testid={'btn-export-csv'}
          variant="secondary"
          onClick={exportCSV}
          isDisabled={isLoading || itemCount === 0 || !onExportCsv}
        >
          {t('Export as CSV')}
        </Button>
      </FlexItem>
    </Flex>
  );
}
