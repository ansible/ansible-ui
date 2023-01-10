import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { useInvalidateCacheOnUnmount } from '../../../common/useInvalidateCache';
import { requestGet, requestPatch, requestPost, swrOptions } from '../../../Data';
import { RouteE } from '../../../Routes';
import { Organization } from '../../interfaces/Organization';
import { getControllerError } from '../../useControllerView';

export function CreateOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<Organization> = async (editedOrganization, setError) => {
    try {
      const organization = await requestPost<Organization>(
        '/api/v2/organizations/',
        editedOrganization
      );
      navigate(RouteE.OrganizationDetails.replace(':id', organization.id.toString()));
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: RouteE.Organizations },
          { label: t('Create organization') },
        ]}
      />
      <PageForm submitText={t('Create organization')} onSubmit={onSubmit} onCancel={onCancel}>
        <OrganizationInputs />
      </PageForm>
    </PageLayout>
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

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<Organization> = async (editedOrganization, setError) => {
    try {
      const organization = await requestPatch<Organization>(
        `/api/v2/organizations/${id}/`,
        editedOrganization
      );
      navigate(RouteE.OrganizationDetails.replace(':id', organization.id.toString()));
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  const onCancel = () => navigate(-1);

  if (!organization) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Organizations'), to: RouteE.Organizations },
            { label: t('Edit organization') },
          ]}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: RouteE.Organizations },
          { label: t('Edit organization') },
        ]}
      />
      <PageForm
        submitText={t('Save organization')}
        onSubmit={onSubmit}
        onCancel={onCancel}
        defaultValue={organization}
      >
        <OrganizationInputs />
      </PageForm>
    </PageLayout>
  );
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
