import {
  AnalyticsBuilder,
  MainRequestDefinition,
  OptionsDefinition,
  ObjectType,
} from './AnalyticsBuilder';

export function Test() {
  return (
    <AnalyticsBuilder
      main_url="/api/v2/analytics/report/automation_calculator/"
      processMainData={processMainDataForReports}
      rowKeyFn={(item) => item.id}
    ></AnalyticsBuilder>
  );
}

function processMainDataForReports(data: MainRequestDefinition) {
  data.report.layoutProps.optionsEndpoint = '/api/v2/analytics/roi_templates_options/';
  data.report.layoutProps.dataEndpoint = '/api/v2/analytics/roi_templates/';
}
