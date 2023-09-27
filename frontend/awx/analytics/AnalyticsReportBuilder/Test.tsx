import {
  AnalyticsReportBuilder,
  AnalyticsReportBuilderProps,
  AnyType,
} from './AnalyticsReportBuilder';
import { useLocation, useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core';

import { reportDefaultParams, allDefaultParams } from './constants';

export function Test() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);

  const reportName = queryParams.get('reportName') || '';

  const props = {} as AnalyticsReportBuilderProps;

  fillReports(props, reportName);
  fillDefaultProps(props);

  const items = fillReportTypes();

  function selectionChange(item: string) {
    navigate(`${location.pathname}?reportName=${item}`);
  }

  return (
    <>
      <MySelectDropdown items={items} onChange={(item) => selectionChange(item)} />
      {reportName && <AnalyticsReportBuilder {...props} key={reportName}></AnalyticsReportBuilder>}
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

function fillReports(props: AnalyticsReportBuilderProps, name: string) {
  props.main_url = `/api/v2/analytics/report/${name}/`;
  const defaultParams = reportDefaultParams(name);

  props.defaultDataParams = defaultParams;
}

function fillDefaultProps(props: AnalyticsReportBuilderProps) {
  props.rowKeyFn = (item) => item.id;
}

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
      placeholderText={'Select an item'}
    >
      {props.items.map((item, index) => (
        <SelectOption key={index} value={item} />
      ))}
    </Select>
  );
};
