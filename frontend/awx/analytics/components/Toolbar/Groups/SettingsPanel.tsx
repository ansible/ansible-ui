import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Popover,
  Switch,
} from '@patternfly/react-core';
import {
  OutlinedQuestionCircleIcon as PFOutlinedQuestionCircleIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AttributeType, SetValues } from '../types';

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
  onChange?: (event: React.FormEvent<HTMLInputElement>, checked: boolean) => void;
  ariaLabel?: string;
  bodyContent?: string;
}

export const SettingsPanel: FunctionComponent<Props> = ({
  settingsExpanded,
  setSettingsExpanded,
  id,
  label,
  labelOff,
  isChecked,
  onChange,
  ariaLabel,
  bodyContent,
}) => {
  const { t } = useTranslation();
  return (
    <Card isFlat style={{ backgroundColor: '#EEEEEE' }}>
      <CardHeader
        actions={{
          actions: (
            <>
              <Button variant="plain" onClick={() => setSettingsExpanded(!settingsExpanded)}>
                <TimesIcon />
              </Button>
            </>
          ),
          hasNoOffset: false,
          className: undefined,
        }}
      >
        <CardTitle>{t('Settings')}</CardTitle>
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
          <Popover aria-label={ariaLabel} position={'top'} bodyContent={<div> {bodyContent} </div>}>
            <OutlinedQuestionCircleIcon />
          </Popover>
        </PopoverButton>
      </CardBody>
    </Card>
  );
};
