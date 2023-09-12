import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import background from '../../node_modules/@patternfly/patternfly/assets/images/pfbg_1200.jpg';
import { useLoginModal } from './LoginModal';
import type { AuthOptions } from './SocialAuthLogin';

type LoginProps = {
  authOptions?: AuthOptions;
  apiUrl?: string;
  onLoginUrl?: string;
};

export function Login(props: LoginProps) {
  const { authOptions, apiUrl, onLoginUrl } = props;
  const navigate = useNavigate();
  const navigateBack = useCallback(() => {
    navigate('/');
  }, [navigate]);
  const openLoginModal = useLoginModal({
    authOptions,
    apiUrl,
    onLoginUrl,
    onLogin: navigateBack,
  });
  useEffect(() => openLoginModal(), [openLoginModal]);

  return (
    <div
      style={{
        minWidth: '100%',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#444',
        backgroundImage: `url(${background})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    />
  );
}
