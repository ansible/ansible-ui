import { RouteObj } from '../../../../../Routes';
import { Schedule } from '../../../../interfaces/Schedule';

export function getScheduleResourceUrl(schedule: Schedule): string {
  const getResourceTypeSubString: (type: string) => string = (type) => {
    let urlSubString = '';
    switch (type) {
      case 'job':
        urlSubString = 'templates/job_template';
        break;
      case 'inventory_update':
        urlSubString = 'inventories/inventory';
        break;
      case 'project_update':
        urlSubString = 'projects';
        break;
      case 'system_job':
        urlSubString = 'management_jobs';
        break;
      case 'workflow_job':
        urlSubString = 'templates/workflow_job_template';
        break;
    }
    return urlSubString;
  };

  const urlSubStringMap: { [urlSegment: string]: string } = {
    ':resource_id': `${schedule.summary_fields.unified_job_template.id.toString()}`,
    ':schedule_id': `${schedule.id.toString()}`,
    ':resource_type': getResourceTypeSubString(
      schedule.summary_fields.unified_job_template.unified_job_type
    ),
  };
  const str: string = RouteObj.ScheduleEdit.replace(
    /:resource_id|:schedule_id|:resource_type/g,
    (matched: string) => urlSubStringMap[matched]
  );
  return str;
}
