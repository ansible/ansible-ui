import {
  AnalyticsBuilder,
  MainRequestDefinition,
  OptionsDefinition,
  ObjectType,
  AnalyticsBuilderProps,
  FillDefaultProps,
} from './AnalyticsBuilder';

import {useState } from 'react';

import { reportDefaultParams } from './constants';

export function Test() {
  const [reportName, setReportName ] = useState<string>('');
  const props = {} as AnalyticsBuilderProps;

  fillReports(props, reportName);
  fillDefaultProps(props);

  const items = fillReportTypes();


  return ( 
    <>
    
   
    {reportName && <AnalyticsBuilder {...props}></AnalyticsBuilder>};
  </>);
}

function fillReportTypes()
{
    const items = [];
    
}

function fillReports(props : AnalyticsBuilderProps, name : string)
{
    props.main_url = `/api/v2/analytics/report/${name}/`;
    const defaultParams = reportDefaultParams(name);

    props.defaultDataParams = defaultParams;
    props.defaultDataParams = defaultParams;
}

function fillDefaultProps(props : AnalyticsBuilderProps)
{
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


