import { useURLSearchParams } from '@ansible/ansible-ui-framework/components/useURLSearchParams';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Redirect() {
  const [searchParams] = useURLSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (searchParams.has('next')) {
      location.href = searchParams.get('next') as string;
    } else {
      void navigate('/');
    }
  }, [navigate, searchParams]);
  return null;
}
