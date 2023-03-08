import React from 'react';
import { Switch } from '@patternfly/react-core';

export function SwitchCell(props: { state: boolean }) {
  return (
    <div style={{ maxWidth: '0' }}>
      <Switch isChecked={props.state} />
    </div>
  );
}
