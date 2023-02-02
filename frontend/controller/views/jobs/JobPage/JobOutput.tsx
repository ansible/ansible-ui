import {
  Button,
  Checkbox,
  PageSection,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';
import { useMemo, useRef, useState } from 'react';
import { useSettings } from '../../../../../framework';
import { ItemsResponse, useGet2 } from '../../../../Data';
import { JobEvent } from '../../../interfaces/generated-from-swagger/api';
import { Job } from '../../../interfaces/Job';

export function JobOutput(props: { job: Job }) {
  const { job } = props;
  const { data: itemsResponse } = useGet2<ItemsResponse<JobEvent>>({
    url: job
      ? // ? `/api/v2/jobs/${job.id.toString()}/events/?order_by=counter&page=1&page_size=50`
        `/api/v2/jobs/${job.id.toString()}/job_events/`
      : '',
    query: { order_by: 'counter', page: 1, page_size: 50 },
  });

  const settings = useSettings();
  const logViewerRef = useRef<HTMLDivElement>();
  const [isTextWrapped, setIsTextWrapped] = useState(false);

  const FooterButton = () => {
    const handleClick = (e) => {
      logViewerRef.current.scrollToBottom();
    };
    return <Button onClick={handleClick}>Jump to the bottom</Button>;
  };

  const data = useMemo(() => {
    const jobEvents = itemsResponse?.results;
    const data: string[] = [];
    if (jobEvents) {
      while (data.length < 10000) {
        data.push(jobEvents[data.length % jobEvents.length].stdout ?? '');
      }
    }

    return data;
  }, [itemsResponse]);

  if (!job) return <Skeleton />;
  if (!itemsResponse) return <></>;
  if (!itemsResponse.results) return <></>;

  return (
    <PageSection variant="light">
      <LogViewer
        ref={logViewerRef}
        hasLineNumbers
        height="100%"
        data={data}
        theme={settings.activeTheme}
        isTextWrapped={isTextWrapped}
        toolbar={
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <LogViewerSearch placeholder="Search" minSearchChars={2} />
              </ToolbarItem>

              <ToolbarItem>
                <Checkbox
                  label="Wrap text"
                  aria-label="wrap text checkbox"
                  isChecked={isTextWrapped}
                  id="wrap-text-checkbox"
                  onChange={setIsTextWrapped}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        }
        footer={<FooterButton />}
      />
    </PageSection>
  );
}
