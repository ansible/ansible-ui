import {
  PageSection,
  Label,
  SearchInput,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobStatusBar } from './JobStatusBar';
import { HostStatusBar } from './HostStatusBar';
import { JobOutputToolbar } from './JobOutputToolbar';
import { JobOutputEvents } from './JobOutputEvents';

const Section = styled(PageSection)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 204px);
`;

export function JobOutput(props: { job: Job }) {
  const { job } = props;
  const { t } = useTranslation();

  if (!job) {
    return <Skeleton />;
  }
  return (
    <Section variant="light" className="dark-1">
      <JobStatusBar job={job} />
      <HostStatusBar job={job} />
      <JobOutputToolbar job={job} />
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
    </Section>
  );
}
