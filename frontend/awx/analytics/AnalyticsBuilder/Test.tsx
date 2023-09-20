import {
  AnalyticsBuilder,
  MainRequestDefinition,
  OptionsDefinition,
  ObjectType,
  AnalyticsBuilderProps,
  FillDefaultProps,
} from './AnalyticsBuilder';

import { useState } from 'react';
import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core';

import { reportDefaultParams, allDefaultParams } from './constants';

export function Test() {
  const [reportName, setReportName] = useState<string>('');
  const props = {} as AnalyticsBuilderProps;

  fillReports(props, reportName);
  fillDefaultProps(props);

  const items = fillReportTypes();

  return (
    <>
      <MySelectDropdown items={items} onChange={(item) => setReportName(item)} />
      Selected : {reportName} <br />
      {reportName && <AnalyticsBuilder {...props}></AnalyticsBuilder>}
    </>
  );
}

function fillReportTypes() {
  const items: string[] = [];
  for (const key in allDefaultParams) {
    items.push(key);
  }
  return items;
}

function fillReports(props: AnalyticsBuilderProps, name: string) {
  props.main_url = `/api/v2/analytics/report/${name}/`;
  const defaultParams = reportDefaultParams(name);

  props.defaultOptionsParams = defaultParams;
  props.defaultDataParams = defaultParams;
}

function fillDefaultProps(props: AnalyticsBuilderProps) {
  props.rowKeyFn = (item) => item.id;
}

/*
const automationCalculator = {
  main_url: '/api/v2/analytics/report/automation_calculator/',
};

const hostsByOrganizationParams = reportDefaultParams('hosts_by_organization');

const hostsByOrganization: AnalyticsBuilderProps = {
  main_url: '/api/v2/analytics/report/hosts_by_organization/',
  defaultOptionsParams: hostsByOrganizationParams,
  defaultDataParams: hostsByOrganizationParams,
};*/

const MySelectDropdown = (props: { items: string[]; onChange: (item: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>('');

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = (event: any, selection: SelectOptionObject) => {
    setSelected(selection.toString());
    setIsOpen(!isOpen);
    props.onChange(selection.toString());
  };

  return (
    <Select
      isOpen={isOpen}
      selections={selected}
      onToggle={onToggle}
      onSelect={onSelect}
      placeholderText="Select an item"
    >
      {props.items.map((item, index) => (
        <SelectOption key={index} value={item} />
      ))}
    </Select>
  );
};
