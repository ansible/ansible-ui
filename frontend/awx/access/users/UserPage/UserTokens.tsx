/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { usePageNavigate, PageNotImplemented } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';

export function UserTokens() {
  const params = useParams<{ id: string }>();
  //const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const pageNavigate = usePageNavigate();

  useEffect(() => {
    if (activeAwxUser?.id === undefined || activeAwxUser?.id.toString() !== params.id) {
      pageNavigate(AwxRoute.Users);
    }
  });

  return (
    <>
      <PageNotImplemented></PageNotImplemented>
    </>
  );
}
