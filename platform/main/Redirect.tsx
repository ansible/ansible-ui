import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useURLSearchParams } from '../../framework/components/useURLSearchParams';

export function Redirect() {
  const [searchParams] = useURLSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (searchParams.has('next')) {
      location.href = searchParams.get('next') as string;
    } else {
      navigate('/');
    }
  }, [navigate, searchParams]);
  return null;
}
