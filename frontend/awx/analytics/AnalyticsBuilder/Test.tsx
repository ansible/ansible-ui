import {
  AnalyticsBuilder,
  MainDataDefinition,
  OptionsDefinition,
  ObjectType,
  AnalyticsBuilderProps,
  FillDefaultProps,
  AnyType,
} from './AnalyticsBuilder';
import { useLocation, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core';

import { reportDefaultParams, allDefaultParams } from './constants';

export function Test() {
  const location = useLocation();
  const navigate = useNavigate();

  //const [reportName, setReportName] = useState<string>('');
  const queryParams = new URLSearchParams(location.search);

  const reportName = queryParams.get('reportName') || '';

  const props = {} as AnalyticsBuilderProps;

  fillReports(props, reportName);
  fillDefaultProps(props);

  const items = fillReportTypes();

  function selectionChange(item: string) {
    navigate(`${location.pathname}?reportName=${item}`);

    /*const query = new URLSearchParams(location.search);
    query.delete('sort');
    navigate(`${location.pathname}?${query.toString()}`);*/
  }

  /*
  useEffect( () => {
    const query = new URLSearchParams(location.search);
    query.delete('sort');
    navigate(`${location.pathname}?${query.toString()}`);
  }, [])*/

  return (
    <>
      <MySelectDropdown items={items} onChange={(item) => selectionChange(item)} />
      Selected : {reportName} <br />
      {reportName && <AnalyticsBuilder {...props} key={reportName}></AnalyticsBuilder>}
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

  const onSelect = (event: AnyType, selection: SelectOptionObject) => {
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
