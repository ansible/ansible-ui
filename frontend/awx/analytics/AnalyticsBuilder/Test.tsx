import {
  AnalyticsBuilder,
  MainRequestDefinition,
  OptionsDefinition,
  ObjectType,
  AnalyticsBuilderProps,
  FillDefaultProps,
} from './AnalyticsBuilder';

import { reportDefaultParams } from './constants';

export function Test() {
  const props = hostsByOrganization as AnalyticsBuilderProps;
  FillDefaultProps(props);
  return <AnalyticsBuilder {...props}></AnalyticsBuilder>;
}

const reports = {
  main_url: '/api/v2/analytics/report/automation_calculator/',

  /*processMainData: (data: MainRequestDefinition) => {
    data.report.layoutProps.optionsEndpoint = '/api/v2/analytics/roi_templates_options/';
    data.report.layoutProps.dataEndpoint = '/api/v2/analytics/roi_templates/';
  },*/
};

const hostsByOrganizationParams = reportDefaultParams('hosts_by_organization');

const hostsByOrganization: AnalyticsBuilderProps = {
  main_url: '/api/v2/analytics/report/hosts_by_organization/',
  defaultOptionsParams: hostsByOrganizationParams,
  defaultDataParams: hostsByOrganizationParams,
};
