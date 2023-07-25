import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
} from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../../../interfaces/EdaDecisionEnvironment';
import { EdaCredentialCell } from '../../credentials/components/EdaCredentialCell';

export function useDecisionEnvironmentsColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaDecisionEnvironment>[]>(
    () => [
      {
        header: t('Name'),
        cell: (decisionEnvironment) => (
          <TextCell
            text={decisionEnvironment.name}
            to={RouteObj.EdaDecisionEnvironmentDetails.replace(
              ':id',
              decisionEnvironment.id.toString()
            )}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (decisionEnvironment) => decisionEnvironment.description,
        table: ColumnTableOption.Description,
        card: 'description',
        list: 'description',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Image'),
        cell: (decisionEnvironment) => <TextCell text={decisionEnvironment.image_url} />,
        value: (decisionEnvironment) => decisionEnvironment.image_url,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Credential'),
        cell: (decisionEnvironment) => <EdaCredentialCell id={decisionEnvironment.credential_id} />,
        value: (decisionEnvironment) => decisionEnvironment.credential_id,
        // table: ColumnTableOption.Expanded,
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
    ],
    [t]
  );
}

export function useDecisionEnvironmentColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaDecisionEnvironmentRead>[]>(
    () => [
      {
        header: t('Name'),
        cell: (decisionEnvironment) => (
          <TextCell
            text={decisionEnvironment.name}
            to={RouteObj.EdaDecisionEnvironmentDetails.replace(
              ':id',
              decisionEnvironment.id.toString()
            )}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (decisionEnvironment) => decisionEnvironment.description,
        table: ColumnTableOption.Description,
        card: 'description',
        list: 'description',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Image'),
        cell: (decisionEnvironment) => <TextCell text={decisionEnvironment.image_url} />,
        value: (decisionEnvironment) => decisionEnvironment.image_url,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Credential'),
        cell: (decisionEnvironment) => (
          <EdaCredentialCell id={decisionEnvironment.credential?.id} />
        ),
        value: (decisionEnvironment) => decisionEnvironment?.credential?.id,
        // table: ColumnTableOption.Expanded,
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
    ],
    [t]
  );
}
