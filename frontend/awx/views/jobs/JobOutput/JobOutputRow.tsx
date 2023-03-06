/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JobEvent } from '../../../interfaces/JobEvent';

export interface IJobOutputRow {
  counter: number;
  uuid: string;
  playUuid: string;
  taskUuid: string;
  line: number;
  stdout: string;
  eventLine: number;
  canCollapse: boolean;
  // jobEvent: JobEvent;
  isHeaderLine: boolean;
  created?: string;
}

export function jobEventToRows(jobEvent: JobEvent): IJobOutputRow[] {
  const playUuid = (jobEvent.event_data as { play_uuid?: string }).play_uuid ?? '';
  const taskUuid = (jobEvent.event_data as { task_uuid?: string }).task_uuid ?? '';

  if (!jobEvent.counter) return [];
  if (!jobEvent.stdout) return [];

  const lines = jobEvent.stdout.split('\r\n');
  let canCollapse = false;

  switch (jobEvent.event) {
    case 'playbook_on_play_start':
    case 'playbook_on_task_start':
    case 'playbook_on_stats':
      canCollapse = playUuid !== '' || taskUuid !== '';
  }

  let isHeaderLine = false;
  let foundHeaderLine = false;
  return lines.map((stdout, eventLine) => {
    if (jobEvent.parent_uuid) {
      if (stdout) {
        isHeaderLine = !foundHeaderLine;
        foundHeaderLine = true;
      } else {
        isHeaderLine = false;
      }
    }
    const jobOutputRow: IJobOutputRow = {
      line: jobEvent.start_line! + eventLine,
      counter: jobEvent.counter!,
      stdout,
      uuid: jobEvent.uuid ?? '',
      playUuid: playUuid ?? '',
      taskUuid: taskUuid ?? '',
      eventLine,
      canCollapse: canCollapse && isHeaderLine,
      // jobEvent,
      isHeaderLine,
      created: jobEvent.created,
    };
    return jobOutputRow;
  });
}
