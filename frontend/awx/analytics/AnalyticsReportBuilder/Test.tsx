/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AnalyticsReportBuilder,
  AnalyticsReportBuilderProps,
  AnyType,
} from './AnalyticsReportBuilder';

import { useState } from 'react';

import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated';
import { awxAPI } from '../../common/api/awx-utils';
import { allDefaultParams } from './constants';

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
      <MySelectDropdown
        items={items}
        onChange={(item) => selectionChange(item)}
        selected={reportName}
      />
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
  props.main_url = awxAPI`/analytics/report/${name}/`;
  props.report_name = name;
}

function fillDefaultProps(props: AnalyticsReportBuilderProps) {
  props.rowKeyFn = (item) => item.id;
}

const MySelectDropdown = (props: {
  items: string[];
  onChange: (item: string) => void;
  selected: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = (event: AnyType, selection: SelectOptionObject) => {
    setIsOpen(!isOpen);
    props.onChange(selection.toString());
  };

  return (
    <Select
      isOpen={isOpen}
      onToggle={(_event, isOpen: boolean) => onToggle(isOpen)}
      selections={props.items.find((item) => item === props.selected)}
      onSelect={onSelect}
      placeholderText=""
    >
      {props.items.map((item, index) => (
        <SelectOption key={index} value={item} />
      ))}
    </Select>
  );
};
