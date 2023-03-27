import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaCredential } from '../../../interfaces/EdaCredential';

export function useCredentialColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaCredential>[]>(
    () => [
      {
        header: t('Name'),
        cell: (credential) => (
          <TextCell
            text={credential.name}
            onClick={() =>
              navigate(RouteObj.EdaCredentialDetails.replace(':id', credential.id.toString()))
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Type'),
        cell: (credential) => <TextCell text={credential.credential_type} />,
      },
    ],

    [navigate, t]
  );
}
