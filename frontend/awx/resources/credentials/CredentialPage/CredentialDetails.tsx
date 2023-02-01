/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { PageDetail, PageDetails, DateTimeCell, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Credential } from '../../../interfaces/Credential';
import { ItemsResponse, requestGet, swrOptions, useFetcher } from '../../../../common/crud/Data';
import { CredentialInputSource } from '../../../interfaces/CredentialInputSource';
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialTypeDetail } from '../components/CredentialTypeDetail';

export function CredentialDetails(props: { credential: Credential }) {
  const { t } = useTranslation();
  const { credential } = props;
  const history = useNavigate();

  const { summary_fields, inputs: credentialInputs } = credential;
  const fetcher = useFetcher();
  const getKey: (
    pageIndex: number,
    previousPageData: ItemsResponse<CredentialInputSource>
  ) => string | null = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.next) return null;
    return `/api/v2/credentials/${credential.id}/input_sources/?page=${
      pageIndex + 1
    }&page_size=200`;
  };

  const { data } = useSWRInfinite<ItemsResponse<CredentialInputSource>>(getKey, fetcher, {
    initialSize: 200,
  });

  const { data: credentialType } = useSWR<CredentialType>(
    `/api/v2/credential_types/${summary_fields.credential_type.id.toString()}/`,
    requestGet,
    swrOptions
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
  const inputSources = data?.reduce(
    (items: CredentialInputSource[], page: ItemsResponse<CredentialInputSource>) => {
      if (Array.isArray(page.results)) {
        return [...items, ...page.results];
      }
      return items;
    },
    []
  );

  const inputSourcesMap = inputSources?.reduce(
    (map: Record<string, CredentialInputSource>, inputSource) => {
      map[inputSource.input_field_name] = inputSource;
      return map;
    },
    {}
  );
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{credential.name}</PageDetail>
      <PageDetail label={t('Description')}>{credential.description}</PageDetail>
      <PageDetail label={t('Organization')}>
        <TextCell
          text={credential.summary_fields?.organization?.name}
          to={RouteObj.OrganizationDetails.replace(
            ':id',
            (credential.summary_fields?.organization?.id ?? '').toString()
          )}
        />
      </PageDetail>
      <PageDetail label={t('Credential type')}>
        <TextCell
          text={credential.summary_fields?.credential_type?.name}
          to={RouteObj.CredentialTypeDetails.replace(
            ':id',
            (credential.summary_fields?.credential_type?.id ?? '').toString()
          )}
        />
      </PageDetail>
      {inputSources &&
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
    </PageDetails>
  );
}
