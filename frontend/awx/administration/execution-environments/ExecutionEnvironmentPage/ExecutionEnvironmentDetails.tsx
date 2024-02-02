import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../../main/AwxRoutes';

export function ExecutionEnvironmentDetails() {
  const params = useParams<{ id: string }>();
  const { data: execution_environment } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    params.id
  );
  return execution_environment ? (
    <ExecutionEnvironmentDetailInner execution_env={execution_environment} />
  ) : null;
}

export function ExecutionEnvironmentDetailInner(props: { execution_env: ExecutionEnvironment }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const execution_env = props.execution_env;

  return (
    <PageDetails data-cy="execution-environment-page-detail">
      <PageDetail data-cy="execution-environment-page-detail" label={t('Name')}>
        {execution_env.name}
      </PageDetail>
      <PageDetail data-cy="execution-environment-page-detail" label={t('Image')}>
        {execution_env.image}
      </PageDetail>
      <PageDetail data-cy="execution-environment-page-detail" label={t('Description')}>
        {execution_env.description}
      </PageDetail>
      <PageDetail
        data-cy="execution-environment-page-detail"
        label={t('Managed')}
      >{`${execution_env.managed}`}</PageDetail>
      <PageDetail data-cy="execution-environment-page-detail" label={t('Organization')}>
        {execution_env.summary_fields?.organization ? (
          <TextCell
            text={execution_env.summary_fields?.organization?.name}
            to={getPageUrl(AwxRoute.OrganizationPage, {
              params: { id: execution_env.summary_fields?.organization?.id },
            })}
          />
        ) : undefined}
      </PageDetail>
      <PageDetail data-cy="execution-environment-page-detail" label={t('Pull')}>
        {execution_env.pull}
      </PageDetail>
      <PageDetail data-cy="execution-environment-page-detail" label={t('Registry Credential')}>
        {execution_env?.summary_fields?.credential?.name ? (
          <Label variant="outline" color="blue">
            {execution_env?.summary_fields?.credential?.name}
          </Label>
        ) : undefined}
      </PageDetail>
      <PageDetail data-cy="execution-environment-page-detail" label={t('Created')}>
        <DateTimeCell
          format="date-time"
          value={execution_env.created}
          author={execution_env?.summary_fields?.created_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, {
              params: { id: execution_env?.summary_fields?.created_by?.id },
            })
          }
        />
      </PageDetail>
      <LastModifiedPageDetail
        data-cy="execution-environment-page-detail"
        value={execution_env.modified}
        author={execution_env?.summary_fields?.modified_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, {
            params: { id: execution_env?.summary_fields?.modified_by?.id },
          })
        }
      ></LastModifiedPageDetail>
    </PageDetails>
  );
}
