import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { PageBody, PageForm, PageFormSubmitHandler, PageHeader } from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { requestGet, requestPatch, requestPost, swrOptions } from '../../../Data';
import { RouteE } from '../../../Routes';
import { Organization } from '../../interfaces/Organization';
import { getControllerError } from '../../useControllerView';

export function CreateOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<Organization> = async (editedOrganization, setError) => {
    try {
      const organization = await requestPost<Organization>(
        '/api/v2/organizations/',
        editedOrganization
      );
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(RouteE.OrganizationDetails.replace(':id', organization.id.toString()));
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  const onCancel = () => navigate(-1);

  return (
    <>
      <PageHeader
        title={t('Create organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: RouteE.Organizations },
          { label: t('Create organization') },
        ]}
      />
      <PageBody>
        <PageForm submitText={t('Create organization')} onSubmit={onSubmit} onCancel={onCancel}>
          <OrganizationInputs />
        </PageForm>
      </PageBody>
    </>
  );
}

export function EditOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: organization } = useSWR<Organization>(
    Number.isInteger(id) ? `/api/v2/organizations/${id.toString()}/` : undefined,
    requestGet,
    swrOptions
  );

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<Organization> = async (editedOrganization, setError) => {
    try {
      const organization = await requestPatch<Organization>(
        `/api/v2/organizations/${id}/`,
        editedOrganization
      );
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(RouteE.OrganizationDetails.replace(':id', organization.id.toString()));
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  const onCancel = () => navigate(-1);

  if (!organization) {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: t('Organizations'), to: RouteE.Organizations },
            { label: t('Edit organization') },
          ]}
        />
      </>
    );
  } else {
    return (
      <>
        <PageHeader
          title={t('Edit organization')}
          breadcrumbs={[
            { label: t('Organizations'), to: RouteE.Organizations },
            { label: t('Edit organization') },
          ]}
        />
        <PageBody>
          <PageForm
            submitText={t('Save organization')}
            onSubmit={onSubmit}
            onCancel={onCancel}
            defaultValue={organization}
          >
            <OrganizationInputs />
          </PageForm>
        </PageBody>
      </>
    );
  }
}

function OrganizationInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput label={t('Name')} name="name" placeholder={t('Enter name')} isRequired />
      <PageFormTextInput
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      {/* instanceGroups */}
      {/* executionEnvironments */}
      {/* galaxyCredentials */}
    </>
  );
}
