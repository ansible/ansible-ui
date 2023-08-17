import { Dispatch, SetStateAction } from 'react';
import { Toolbar, ToolbarContent, Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  IFilterState,
  PageToolbarFilters,
} from '../../../../../framework/PageToolbar/PageToolbarFilter';
import { IToolbarFilter } from '../../../../../framework';
import { JobStatus, isJobRunning } from './util';

interface IJobOutputToolbarProps {
  toolbarFilters: IToolbarFilter[];
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
  jobStatus?: JobStatus;
  isFollowModeEnabled: boolean;
  setIsFollowModeEnabled: (value: boolean) => void;
}

export function JobOutputToolbar(props: IJobOutputToolbarProps) {
  const {
    toolbarFilters,
    filterState,
    setFilterState,
    jobStatus,
    isFollowModeEnabled,
    setIsFollowModeEnabled,
  } = props;
  const { t } = useTranslation();

  const handleFollowToggle = () => {
    if (isFollowModeEnabled) {
      setIsFollowModeEnabled(false);
    } else {
      setIsFollowModeEnabled(true);
    }
  };

  return (
    <Toolbar clearAllFilters={() => setFilterState({})}>
      <ToolbarContent>
        <PageToolbarFilters
          toolbarFilters={toolbarFilters}
          filterState={filterState}
          setFilterState={setFilterState}
        />
        {isJobRunning(jobStatus) ? (
          <Button
            variant={isFollowModeEnabled ? 'secondary' : 'primary'}
            onClick={handleFollowToggle}
          >
            {isFollowModeEnabled ? t('Unfollow') : t('Follow')}
          </Button>
        ) : null}
      </ToolbarContent>
    </Toolbar>
  );
}
