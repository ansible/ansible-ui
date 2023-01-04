import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../framework';
import { PageFormSchema } from '../../../framework/PageForm/PageFormSchema';
import { useGet } from '../../common/useItem';
import { requestPatch, requestPost } from '../../Data';
import { RouteE } from '../../Routes';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';

export function EditRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: rulebookActivation } = useGet<EdaRulebookActivation>(
    `/api/activation_instances/${id.toString()}`
  );

  const RulebookActivationSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
      }),
    [t]
  );

  type RulebookActivationSchema = Static<typeof RulebookActivationSchemaType>;

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<RulebookActivationSchema> = async (
    rulebookActivation,
    setError
  ) => {
    try {
      if (Number.isInteger(id)) {
        rulebookActivation = await requestPatch<EdaRulebookActivation>(
          `/api/activation_instances/${id}`,
          rulebookActivation
        );
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(-1);
      } else {
        const newRulebookActivation = await requestPost<EdaRulebookActivation>(
          '/api/activation_instances',
          rulebookActivation
        );
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(
          RouteE.EdaRulebookActivationDetails.replace(':id', newRulebookActivation.id.toString())
        );
      }
    } catch (err) {
      setError('TODO');
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!rulebookActivation) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Rulebook activations'), to: RouteE.EdaRulebookActivations },
              { label: t('Edit rulebook activation') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit rulebook activation')}
            breadcrumbs={[
              { label: t('Rulebook activations'), to: RouteE.EdaRulebookActivations },
              { label: t('Edit rulebook activation') },
            ]}
          />
          <PageForm
            schema={RulebookActivationSchemaType}
            submitText={t('Save rulebook activation')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={rulebookActivation}
          >
            <PageFormSchema schema={RulebookActivationSchemaType} />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create rulebook activation')}
          breadcrumbs={[
            { label: t('RulebookActivations'), to: RouteE.EdaRulebookActivations },
            { label: t('Create rulebook activation') },
          ]}
        />
        <PageForm
          schema={RulebookActivationSchemaType}
          submitText={t('Create rulebook activation')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormSchema schema={RulebookActivationSchemaType} />
        </PageForm>
      </PageLayout>
    );
  }
}
