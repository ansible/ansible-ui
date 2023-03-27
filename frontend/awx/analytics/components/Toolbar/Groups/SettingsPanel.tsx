import React, { FunctionComponent } from 'react';
import { Button, Switch, Popover } from '@patternfly/react-core';
import {
  Card,
  CardTitle,
  CardBody,
  CardActions,
  CardHeader,
} from '@patternfly/react-core';
import {
  OutlinedQuestionCircleIcon as PFOutlinedQuestionCircleIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { SetValues, AttributeType } from '../types';
import styled from 'styled-components';

const OutlinedQuestionCircleIcon = styled(PFOutlinedQuestionCircleIcon)`
  color: #151515;
`;

const PopoverButton = styled(Button)`
  vertical-align: middle;
`;

interface Props {
  filters: Record<string, AttributeType>;
  setFilters: SetValues;
  settingsExpanded: boolean;
  setSettingsExpanded: (expanded: boolean) => void;
  id?: string;
  label?: string;
  labelOff?: string;
  isChecked?: AttributeType;
  onChange?: (
    checked: boolean,
    event: React.FormEvent<HTMLInputElement>
  ) => void;
  ariaLabel?: string;
  bodyContent?: string;
}

const SettingsPanel: FunctionComponent<Props> = ({
  settingsExpanded,
  setSettingsExpanded,
  id,
  label,
  labelOff,
  isChecked,
  onChange,
  ariaLabel,
  bodyContent,
}) => (
  <Card isFlat style={{ backgroundColor: '#EEEEEE' }}>
    <CardHeader>
      <CardActions>
        <Button
          variant="plain"
          onClick={() => setSettingsExpanded(!settingsExpanded)}
        >
          <TimesIcon />
        </Button>
      </CardActions>
      <CardTitle>Settings</CardTitle>
    </CardHeader>
    <CardBody>
      <Switch
        id={id}
        label={label}
        labelOff={labelOff}
        isChecked={!!isChecked}
        onChange={onChange}
      />
      <PopoverButton variant="plain">
        <Popover
          aria-label={ariaLabel}
          position={'top'}
          bodyContent={<div> {bodyContent} </div>}
        >
          <OutlinedQuestionCircleIcon />
        </Popover>
      </PopoverButton>
    </CardBody>
  </Card>
);

export default SettingsPanel;
