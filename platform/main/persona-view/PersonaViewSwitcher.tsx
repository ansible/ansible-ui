import { Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
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
    <DivStyled>
      <Dropdown
        onSelect={(_event, id) => {
          id && setActivePersonaView(id as PersonaViewType);
          void navigate('/');
          setOpen(false);
        }}
        toggle={(toggleRef) => (
          <MenuToggleStyled
            id="persona-dropdown"
            ref={toggleRef}
            onClick={() => setOpen(!open)}
            isExpanded={open}
            isFullWidth
          >
            {activePersonaView?.name}
          </MenuToggleStyled>
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
    </DivStyled>
  );
}

const DivStyled = styled.div`
  border-bottom: thin solid #ffffff40;
  padding: 10px 6px;
  @media (min-width: 1200px) {
    padding: 10px 10px;
  }
`;

const MenuToggleStyled = styled(MenuToggle)`
  &::before {
    border: none;
  }
  &::after {
    border: none;
  }
  background-color: #fff1;
  fontweight: bold;
  border: thin solid #ffffff40;
  border-radius: 6px;
  padding-left: 8px;
  @media (min-width: 1200px) {
    padding-left: 14px;
  }
`;
