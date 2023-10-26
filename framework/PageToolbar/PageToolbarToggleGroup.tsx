import { ToolbarToggleGroup, ToolbarToggleGroupProps } from '@patternfly/react-core';
import { useState } from 'react';

export function PageToolbarToggleGroup(props: ToolbarToggleGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const onToggle = (_event: React.MouseEvent) => {
    setIsExpanded(!isExpanded);
  };
  return <ToolbarToggleGroup {...props} isExpanded={isExpanded} onToggle={onToggle} />;
}
