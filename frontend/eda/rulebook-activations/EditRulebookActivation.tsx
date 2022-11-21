import { Static, Type } from '@sinclair/typebox'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'
import {
  FormPageSubmitHandler,
  PageBody,
  PageForm,
  PageHeader,
  PageLayout,
} from '../../../framework'
import { useGet } from '../../common/useItem'
import { requestPatch, requestPost } from '../../Data'
import { RouteE } from '../../Routes'
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation'

export function EditRulebookActivation() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const id = Number(params.id)
  const { data: rulebookActivation } = useGet<EdaRulebookActivation>(
    `/api/rulebookActivations/${id.toString()}`
  )

  const RulebookActivationSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          minLength: 1,
          errorMessage: { minLength: t('Name is required') },
        }),
      }),
    [t]
  )

  type RulebookActivationSchema = Static<typeof RulebookActivationSchemaType>

  const { cache } = useSWRConfig()

  const onSubmit: FormPageSubmitHandler<RulebookActivationSchema> = async (
    rulebookActivation,
    setError
  ) => {
    try {
      if (Number.isInteger(id)) {
        rulebookActivation = await requestPatch<EdaRulebookActivation>(
          `/api/rulebookActivations/${id}`,
          rulebookActivation
        )
        ;(cache as unknown as { clear: () => void }).clear?.()
        navigate(-1)
      } else {
        const newRulebookActivation = await requestPost<EdaRulebookActivation>(
          '/api/rulebookActivations',
          rulebookActivation
        )
        ;(cache as unknown as { clear: () => void }).clear?.()
        navigate(
          RouteE.EdaRulebookActivationDetails.replace(':id', newRulebookActivation.id.toString())
        )
      }
    } catch (err) {
      setError('TODO')
    }
  }
  const onCancel = () => navigate(-1)

  if (Number.isInteger(id)) {
    if (!rulebookActivation) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('RulebookActivations'), to: RouteE.EdaRulebookActivations },
              { label: t('Edit rulebookActivation') },
            ]}
          />
        </PageLayout>
      )
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit rulebookActivation')}
            breadcrumbs={[
              { label: t('RulebookActivations'), to: RouteE.EdaRulebookActivations },
              { label: t('Edit rulebookActivation') },
            ]}
          />
          <PageBody>
            <PageForm
              schema={RulebookActivationSchemaType}
              submitText={t('Save rulebookActivation')}
              onSubmit={onSubmit}
              cancelText={t('Cancel')}
              onCancel={onCancel}
              defaultValue={rulebookActivation}
            />
          </PageBody>
        </PageLayout>
      )
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create rulebookActivation')}
          breadcrumbs={[
            { label: t('RulebookActivations'), to: RouteE.EdaRulebookActivations },
            { label: t('Create rulebookActivation') },
          ]}
        />
        <PageBody>
          <PageForm
            schema={RulebookActivationSchemaType}
            submitText={t('Create rulebookActivation')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
          />
        </PageBody>
      </PageLayout>
    )
  }
}
