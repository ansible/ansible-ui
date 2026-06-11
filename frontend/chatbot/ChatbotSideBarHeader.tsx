import {
  ANSIBLE_LIGHTSPEED_PRODUCT_NAME,
  LIGHTSPEED_LOGO,
  LIGHTSPEED_LOGO_DARK,
} from '@ansible/ansible-ai-connect-chatbot';
import styled from 'styled-components';
import { usePageSettings } from '@ansible/ansible-ui-framework';

const LogoImage = styled.img`
  height: 40px;
  display: inline-block;
  vertical-align: middle;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderTitle = styled.span`
  display: inline-block;
  vertical-align: middle;
`;

const ChatbotSideBarHeader = () => {
  const { activeTheme } = usePageSettings();
  return (
    <HeaderContainer>
      <LogoImage
        src={activeTheme === 'dark' ? String(LIGHTSPEED_LOGO_DARK) : String(LIGHTSPEED_LOGO)}
        alt="Lightspeed Logo"
      />
      <HeaderTitle>{ANSIBLE_LIGHTSPEED_PRODUCT_NAME}</HeaderTitle>
    </HeaderContainer>
  );
};

// eslint-disable-next-line no-restricted-exports
export default ChatbotSideBarHeader;
