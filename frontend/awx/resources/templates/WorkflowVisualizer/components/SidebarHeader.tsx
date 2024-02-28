import styled from 'styled-components';
import { Button, Title } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

const TopologySideBarHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export function SidebarHeader({ onClose, title }: { onClose: () => void; title: string }) {
  return (
    <TopologySideBarHeader>
      <Title headingLevel="h2" style={{ padding: '16px 24px' }}>
        {title}
      </Title>
      <Button variant="plain" onClick={onClose} aria-label="Close">
        <TimesIcon />
      </Button>
    </TopologySideBarHeader>
  );
}
