import { FieldPath, FieldValues } from 'react-hook-form';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  awxApplicationListForbiddenMessage,
  createApplicationListQueryErrorText,
} from '../applicationListAccess';
import { useApplicationListAccess } from '../hooks/useApplicationListAccess';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { useApplicationsColumns } from '../hooks/useApplicationsColumns';
import { useApplicationsFilters } from '../hooks/useApplicationsFilters';
import { Application } from '../../../interfaces/Application';

export function PageFormApplicationSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string; helperText?: string }) {
  const { t } = useTranslation();
  const applicationColumns = useApplicationsColumns({ disableLinks: true });
  const applicationFilters = useApplicationsFilters();
  const applicationsUrl = awxAPI`/applications/`;
  const { canList } = useApplicationListAccess(applicationsUrl);
  const forbiddenMessage = awxApplicationListForbiddenMessage(t);
  const queryErrorText = useMemo(
    () => createApplicationListQueryErrorText(t, forbiddenMessage),
    [forbiddenMessage, t]
  );
  const listForbidden = canList === false;
  const isDisabled = props.isDisabled ?? (listForbidden ? forbiddenMessage : undefined);
  const helperText = props.helperText ?? (listForbidden ? forbiddenMessage : undefined);

  return (
    <PageFormSingleSelectAwxResource<Application, TFieldValues, TFieldName>
      name={props.name}
      id="application"
      label={t('Application')}
      placeholder={t('Select application')}
      queryPlaceholder={t('Loading applications...')}
      queryErrorText={queryErrorText}
      noResultsMessage={t('No options currently available.')}
      isRequired={props.isRequired}
      isDisabled={isDisabled}
      helperText={helperText}
      enableBrowse={!listForbidden}
      url={applicationsUrl}
      tableColumns={applicationColumns}
      toolbarFilters={applicationFilters}
    />
  );
}
