/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageNavigate, PageNotImplemented } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';

export function UserTokens() {
  const params = useParams<{ id: string }>();
  const [showTokens, setShowTokens] = useState(true);
  const { activeAwxUser } = useAwxActiveUser();
  const pageNavigate = usePageNavigate();

  useEffect(() => {
    if (activeAwxUser?.id === undefined || activeAwxUser?.id.toString() !== params.id) {
      setShowTokens(false);
      // redirect to user details for the active/logged-in user
      pageNavigate(AwxRoute.UserDetails, { params: { id: activeAwxUser?.id } });
    }
  }, [activeAwxUser?.id, params.id, setShowTokens, pageNavigate]);

  // not showing anything when user does not match. this helps to test the component.
  return <> {showTokens && <PageNotImplemented></PageNotImplemented>} </>;
}
