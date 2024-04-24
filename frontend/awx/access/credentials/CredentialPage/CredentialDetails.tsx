import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { Credential } from '../../../interfaces/Credential';
import { CredentialInputSource } from '../../../interfaces/CredentialInputSource';
import { CredentialType } from '../../../interfaces/CredentialType';
import { AwxRoute } from '../../../main/AwxRoutes';
import { CredentialTypeDetail } from '../components/CredentialTypeDetail';

const PluginFieldText = styled.p`
  margin-top: 10px;
`;

export function CredentialDetails() {
  const params = useParams<{ id: string }>();
  const { data: credential, isLoading } = useGetItem<Credential>(awxAPI`/credentials`, params.id);

  if (isLoading && !credential) {
    return <LoadingPage />;
  }

  return credential ? <CredentialDetailsInner credential={credential} /> : null;
}

export function CredentialDetailsInner(props: { credential: Credential }) {
  const { t } = useTranslation();
  const { credential } = props;
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();

  const { summary_fields, inputs: credentialInputs } = credential;

  const {
    data: credentialType,
    error,
    refresh,
  } = useGetItem<CredentialType>(
    awxAPI`/credential_types`,
    summary_fields.credential_type.id.toString()
  );
  const {
    results: inputSources,
    error: inputSourcesError,
    isLoading: isInputSourceLoading,
    refresh: refreshInputSources,
  } = useAwxGetAllPages<CredentialInputSource>(
    awxAPI`/credentials/${credential.id.toString()}/input_sources/`
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
            to={getPageUrl(AwxRoute.OrganizationPage, {
              params: { id: credential.summary_fields?.organization?.id },
            })}
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
          value={credential.created}
          author={credential.summary_fields?.created_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, {
              params: { id: credential.summary_fields?.created_by?.id },
            })
          }
        />
      </PageDetail>
      <LastModifiedPageDetail
        value={credential.modified}
        author={credential.summary_fields?.modified_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, {
            params: { id: credential.summary_fields?.modified_by?.id },
          })
        }
      />
      {credentialInputs && inputSources && Object.keys(inputSources).length > 0 && (
        <PluginFieldText>
          {t`* This field will be retrieved from an external secret management system using the specified credential.`}
        </PluginFieldText>
      )}
    </PageDetails>
  );
}
