import { RouteObj } from '../../../../Routes';
import { Schedule } from '../../../interfaces/Schedule';

export function getScheduleResourceUrl(schedule: Schedule, view?: 'details' | null): string {
  const getResourceTypeSubString: string = (() => {
    switch (schedule.summary_fields.unified_job_template.unified_job_type) {
      case 'inventory_update':
        return 'inventories/inventory';
      case 'project_update':
        return 'projects';
      case 'system_job':
        return 'management_jobs';
      case 'workflow_job':
        return 'templates/workflow_job_template';
      default:
        return 'templates/job_template';
    }
  })();

  const urlSubStringMap: { [urlSegment: string]: string } = {
    ':resource_id': `${schedule.summary_fields.unified_job_template.id.toString()}`,
    ':schedule_id': `${schedule.id.toString()}`,
    ':resource_type': getResourceTypeSubString,
  };
  let str: string = RouteObj.EditSchedule.replace(
    /:resource_id|:schedule_id|:resource_type/g,
    (matched: string) => urlSubStringMap[matched]
  );
  if (view === 'details') {
    str = RouteObj.ScheduleDetails.replace(
      /:resource_id|:schedule_id|:resource_type/g,
      (matched: string) => urlSubStringMap[matched]
    );
  }
  return str;
}
