import { IToolbarFilter } from '@ansible/ansible-ui-framework';
import {
  IFilterState,
  PageToolbarFilters,
} from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarFilter';
import { Button, Toolbar, ToolbarContent } from '@patternfly/react-core';
import { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const ToolbarContainer = styled.div`
  padding-left: 24px;
`;

interface RulebookActivationToolbarProps {
  toolbarFilters: IToolbarFilter[];
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
  isFollowModeEnabled: boolean;
  setIsFollowModeEnabled: (isFollowModeEnabled: boolean) => void;
  isRunning: boolean;
  onClearLogs: () => void;
}

export function RulebookActivationToolbar(props: Readonly<RulebookActivationToolbarProps>) {
  const {
    toolbarFilters,
    filterState,
    setFilterState,
    isFollowModeEnabled,
    setIsFollowModeEnabled,
    isRunning,
    onClearLogs,
  } = props;
  const handleFollowToggle = () => {
    if (isFollowModeEnabled) {
      setIsFollowModeEnabled(false);
    } else {
      setIsFollowModeEnabled(true);
    }
  };

  const { t } = useTranslation();
  return (
    <ToolbarContainer>
      <Toolbar clearAllFilters={() => setFilterState({})}>
        <ToolbarContent>
          <PageToolbarFilters
            toolbarFilters={toolbarFilters}
            filterState={filterState}
            setFilterState={setFilterState}
          />
          {isRunning ? (
            <Button
              variant={isFollowModeEnabled ? 'secondary' : 'primary'}
              onClick={handleFollowToggle}
            >
              {isFollowModeEnabled ? t('Unfollow') : t('Follow')}
            </Button>
          ) : null}
          <Button variant="secondary" isDanger={true} onClick={onClearLogs}>
            {t('Clear logs')}
          </Button>
        </ToolbarContent>
      </Toolbar>
    </ToolbarContainer>
  );
}
