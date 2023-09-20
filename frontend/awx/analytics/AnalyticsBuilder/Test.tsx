import {
  AnalyticsBuilder,
  MainRequestDefinition,
  OptionsDefinition,
  ObjectType,
  AnalyticsBuilderProps,
} from './AnalyticsBuilder';

export function Test() {
  const props = reports as AnalyticsBuilderProps;

  return <AnalyticsBuilder {...props}></AnalyticsBuilder>;
}

const reports = {
  main_url: '/api/v2/analytics/report/automation_calculator/',

  processMainData: (data: MainRequestDefinition) => {
    data.report.layoutProps.optionsEndpoint = '/api/v2/analytics/roi_templates_options/';
    data.report.layoutProps.dataEndpoint = '/api/v2/analytics/roi_templates/';
  },

  rowKeyFn: (item: { id: number }) => item.id,
};
