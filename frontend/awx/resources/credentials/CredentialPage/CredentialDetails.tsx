import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageDetail, PageDetails, DateTimeCell, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Credential } from '../../../interfaces/Credential';
import { CredentialInputSource } from '../../../interfaces/CredentialInputSource';
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialTypeDetail } from '../components/CredentialTypeDetail';
import { useMemo } from 'react';
import { useGetAllPagesAWX } from '../../../../common/crud/useGetAllPagesAWX';
import styled from 'styled-components';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { AwxError } from '../../../common/AwxError';

const PluginFieldText = styled.p`
  margin-top: 10px;
`;
export function CredentialDetails(props: { credential: Credential }) {
  const { t } = useTranslation();
  const { credential } = props;
  const history = useNavigate();

  const { summary_fields, inputs: credentialInputs } = credential;

  const {
    data: credentialType,
    error,
    refresh,
  } = useGetItem<CredentialType>(
    `/api/v2/credential_types`,
    summary_fields.credential_type.id.toString()
  );
  const inputLabelsAndValues: {
    id: string;
    label: string;
    help_text: string;
    type: string;
    value: string | number;
  }[] = [];

  if (credentialInputs && credentialType?.inputs?.fields?.length) {
    const { fields } = credentialType.inputs;
    fields.forEach((field) =>
      Object.entries(credentialInputs).forEach(([key, value]) => {
        if (key === field.id) {
          inputLabelsAndValues.push({ ...field, value: value });
        }
      })
    );
  }

  const {
    items: inputSources,
    error: inputSourcesError,
    isLoading: isInputSourceLoading,
    refresh: refreshInputSources,
  } = useGetAllPagesAWX<CredentialInputSource>(
    `/api/v2/credentials/${credential.id}/input_sources/`
  );

  const inputSourcesMap = useMemo(() => {
    return inputSources?.reduce((map: Record<string, CredentialInputSource>, inputSource) => {
      map[inputSource.input_field_name] = inputSource;
      return map;
    }, {});
  }, [inputSources]);

  if (error)
    return (
      <AwxError
        error={error || inputSourcesError}
        handleRefresh={error ? refresh : refreshInputSources}
      />
    );
  if (isInputSourceLoading) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{credential.name}</PageDetail>
      <PageDetail label={t('Description')}>{credential.description}</PageDetail>
      <PageDetail label={t('Organization')}>
        {credential.summary_fields.organization && (
          <TextCell
            text={credential.summary_fields?.organization?.name}
            to={RouteObj.OrganizationDetails.replace(
              ':id',
              (credential.summary_fields?.organization?.id ?? '').toString()
            )}
          />
        )}
      </PageDetail>
      <PageDetail label={t('Credential type')}>
        {credential.summary_fields?.credential_type?.name}
      </PageDetail>
      {inputSourcesMap &&
        credentialInputs &&
        (credentialType?.inputs.fields || []).map((field, i) => (
          <CredentialTypeDetail
            key={`${field.id}+ ${i}`}
            inputs={credentialInputs}
            field={field}
            inputSources={inputSourcesMap}
          />
        ))}
      <PageDetail label={t('Created')}>
        <DateTimeCell
          format="since"
          value={credential.created}
          author={credential.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (credential.summary_fields?.created_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <DateTimeCell
          format="since"
          value={credential.modified}
          author={credential.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (credential.summary_fields?.modified_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      {credentialInputs && inputSources && Object.keys(inputSources).length > 0 && (
        <PluginFieldText>
          {t`* This field will be retrieved from an external secret management system using the specified credential.`}
        </PluginFieldText>
      )}
    </PageDetails>
  );
}
