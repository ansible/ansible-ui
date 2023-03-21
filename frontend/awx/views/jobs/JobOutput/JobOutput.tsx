import {
  Label,
  SearchInput,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobOutputEvents } from './JobOutputEvents';

export function JobOutput(props: { job: Job }) {
  const { t } = useTranslation();
  const { job } = props;
  if (!job) return <Skeleton />;
  return (
    <>
      <Toolbar className="dark-2 border-bottom">
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput />
          </ToolbarItem>
          <div style={{ flexGrow: 1 }} />
          <ToolbarItem>
            {t('Plays')} <Label>{job.playbook_counts?.play_count ?? 0}</Label>
          </ToolbarItem>
          <ToolbarItem>
            {t('Tasks')} <Label>{job.playbook_counts?.task_count ?? 0}</Label>
          </ToolbarItem>
          <ToolbarItem>
            {t('Hosts')}{' '}
            <Label>{job.host_status_counts?.ok ?? 0 + job.host_status_counts?.failures ?? 0}</Label>
          </ToolbarItem>
          <ToolbarItem>
            {t('Failed')} <Label>{job.host_status_counts?.failures ?? 0}</Label>
          </ToolbarItem>
          <ToolbarItem>
            {t('Elapsed')} <Label>{job.elapsed}</Label>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <JobOutputEvents job={job} />
    </>
  );
}
