import React from 'react';
import { Switch } from '@patternfly/react-core';

export function SwitchCell(props: { state: boolean; ariaLabel: string }) {
  return (
    <div style={{ maxWidth: '0' }}>
      <Switch aria-label={props?.ariaLabel} isChecked={props.state} />
    </div>
  );
}
