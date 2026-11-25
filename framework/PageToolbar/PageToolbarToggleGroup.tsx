import { ToolbarToggleGroup, ToolbarToggleGroupProps } from '@patternfly/react-core';
import { createContext, useContext, useState } from 'react';
import { SetRequired } from '../utils/utilityTypes';

export function PageToolbarToggleGroup(props: SetRequired<ToolbarToggleGroupProps, 'id'>) {
  const context = useContext(PageToolbarToggleGroupContext);
  const [uncontrolledIsExpanded, setUncontrolledIsExpanded] = useState(false);
  const isExpanded = context ? context.activeGroup === props.id : uncontrolledIsExpanded;
  const onToggle = (_event: React.MouseEvent) => {
    if (context) {
      context.setActiveGroup(isExpanded ? '' : props.id);
    } else {
      setUncontrolledIsExpanded((expanded) => !expanded);
    }
  };

  return <ToolbarToggleGroup {...props} isExpanded={isExpanded} onToggle={onToggle} />;
}

interface PageToolbarToggleGroupContextProps {
  activeGroup: string;
  setActiveGroup: (group: string) => void;
}

// context that will clost other open groups when a new one is opened
// Path: framework/PageToolbar/PageToolbarToggleGroup.tsx
export const PageToolbarToggleGroupContext = createContext<
  PageToolbarToggleGroupContextProps | undefined
>(undefined);
