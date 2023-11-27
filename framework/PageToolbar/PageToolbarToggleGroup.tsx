import { ToolbarToggleGroup, ToolbarToggleGroupProps } from '@patternfly/react-core';
import { createContext, useContext, useEffect, useState } from 'react';
import { SetRequired } from 'type-fest';

export function PageToolbarToggleGroup(props: SetRequired<ToolbarToggleGroupProps, 'id'>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const onToggle = (_event: React.MouseEvent) => {
    setIsExpanded(!isExpanded);
  };
  const { activeGroup, setActiveGroup } = useContext(PageToolbarToggleGroupContext);

  useEffect(() => {
    if (isExpanded) {
      setActiveGroup(props.id);
    }
  }, [isExpanded, setActiveGroup, props.id]);

  useEffect(() => {
    if (activeGroup !== props.id) {
      setIsExpanded(false);
    }
  }, [activeGroup, props.id]);

  return <ToolbarToggleGroup {...props} isExpanded={isExpanded} onToggle={onToggle} />;
}

interface PageToolbarToggleGroupContextProps {
  activeGroup: string;
  setActiveGroup: (group: string) => void;
}

// context that will clost other open groups when a new one is opened
// Path: framework/PageToolbar/PageToolbarToggleGroup.tsx
export const PageToolbarToggleGroupContext = createContext<PageToolbarToggleGroupContextProps>({
  activeGroup: '',
  setActiveGroup: () => {},
});
