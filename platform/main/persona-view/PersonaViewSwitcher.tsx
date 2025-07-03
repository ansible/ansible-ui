import { Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PersonaViewType } from './PersonaView';
import { usePersonaView } from './usePersonaView';
import { usePersonaViews } from './usePersonaViews';

export function PersonaViewSwitcher() {
  const { activePersonaViewId, setActivePersonaView } = usePersonaView();
  const personaViews = usePersonaViews();
  const [open, setOpen] = useState(false);
  const activePersonaView = personaViews.find((p) => p.id === activePersonaViewId);
  const navigate = useNavigate();
  return (
    <Dropdown
      onSelect={(_event, id) => {
        id && setActivePersonaView(id as PersonaViewType);
        void navigate('/');
        setOpen(false);
      }}
      toggle={(toggleRef) => (
        <MenuToggle
          id="persona-dropdown"
          ref={toggleRef}
          onClick={() => setOpen(!open)}
          isExpanded={open}
          isFullWidth
        >
          {activePersonaView?.name}
        </MenuToggle>
      )}
      isOpen={open}
      onOpenChange={(isOpen) => setOpen(isOpen)}
      onOpenChangeKeys={['Escape']}
      popperProps={{
        appendTo: () => document.body,
        preventOverflow: true,
        enableFlip: true,
        maxWidth: 'trigger',
      }}
    >
      <DropdownList>
        {personaViews.map((p) => (
          <DropdownItem key={p.id} itemId={p.id} description={p.description}>
            {p.name}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
}
