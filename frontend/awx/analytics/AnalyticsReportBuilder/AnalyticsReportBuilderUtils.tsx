import { specificReportDefaultParams } from './constants';
import { Tooltip } from '@patternfly/react-core';

// another function for chart
export const formattedValue = (key: string, value: number) => {
    let val;
    switch (key) {
      case 'elapsed':
        val = value.toFixed(2) + ' seconds';
        break;
      case 'template_automation_percentage':
        val = value.toFixed(2) + '%';
        break;
      case 'successful_hosts_savings':
      case 'failed_hosts_costs':
      case 'monetary_gain':
        val = currencyFormatter(value);
        break;
      default:
        val = value.toFixed(2);
    }
    return val;
  };
  
  // another function for chart
  const currencyFormatter = (n: number): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  
    return formatter.format(n); /* $2,500.00 */
  };
  
  // another function for chart
  export const getDateFormatByGranularity = (granularity: string): string => {
    if (granularity === 'yearly') return 'formatAsYear';
    if (granularity === 'monthly') return 'formatAsMonth';
    if (granularity === 'daily') return 'formatDateAsDayMonth';
    return '';
  };

  export const getClickableText = (
    item: Record<string, string | number>,
    key: string
  ) => {

    const countMapper: { [key: string]: string } = {
      host_task_count: 'module_usage_by_task',
      total_org_count: 'module_usage_by_organization',
      total_template_count: 'module_usage_by_job_template',
      total_templates_per_org: 'templates_explorer',
    };
    if (isNoName(item, key)) return '-';
    if (isOther(item, key)) return '-';
    if (timeFields.includes(key)) return formatTotalTime(+item[key]);
    if (costFields.includes(key)) return currencyFormatter(+item[key]);
    if (Object.keys(countMapper).includes(key) && item.id != -1 && item.name) {
      return (
        <Tooltip content={`View ${item.name} usage`}>
          <a
            onClick={() => navigateToModuleBy(countMapper[key], item.id)}
          >{`${item[key]}`}</a>
        </Tooltip>
      );
    }
    if (Object.keys(countMapper).includes(key) && item.org_id) {
      return (
        <Tooltip content={`View ${item.org_name} usage`}>
          <a
            onClick={() =>
              navigateToTemplatesExplorer(
                countMapper[key],
                item.org_id,
              )
            }
          >{`${item[key]}`}</a>
        </Tooltip>
      );
    }
    return `${item[key]}`;
  };

  const navigateToModuleBy = (slug: string, moduleId: any) => {
    const initialQueryParams = {
      
        ...specificReportDefaultParams(slug),
        task_action_id: [moduleId],
    };
    /*navigate(
      createUrl(
        'reports/' + paths.getDetails(slug).replace('/', ''),
        true,
        initialQueryParams
      )
    );*/
  };

  const navigateToTemplatesExplorer = (
    slug: string,
    org_id: any,
  ) => {
    const initialQueryParams = {
      [DEFAULT_NAMESPACE]: {
        ...specificReportDefaultParams(slug),
        org_id: [org_id],
      },
    };
    /*navigate(
      createUrl(
        'reports/' + paths.getDetails(slug).replace('/', ''),
        true,
        initialQueryParams
      )
    );*/
  };

export const isOther = (item: Record<string, string | number>, key: string) =>
  key === 'id' && item[key] === -1;

export const isNoName = (item: Record<string, string | number>, key: string) =>
  key === 'id' && item[key] === -2;

export const isAvgDuration = (item: Record<string, string | number>, key: string) =>
  key === 'average_duration_per_task';

export const DEFAULT_NAMESPACE = 'default';

const timeFields: string[] = ['elapsed'];
const costFields: string[] = [];

export const formatTotalTime = (elapsed: number): string =>
  new Date(elapsed * 1000).toISOString().substr(11, 8);

export const paths = {
    getDetails: (slug: string): string => `${slug}`,
};
  