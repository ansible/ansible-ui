import { Static, Type } from '@sinclair/typebox'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'
import {
  PageBody,
  PageForm,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
} from '../../../framework'
import { useGet } from '../../common/useItem'
import { requestPatch, requestPost } from '../../Data'
import { RouteE } from '../../Routes'
import { EdaRulebook } from '../interfaces/EdaRulebook'

export function EditRulebook() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const id = Number(params.id)
  const { data: rulebook } = useGet<EdaRulebook>(`/api/rulebooks/${id.toString()}`)

  const RulebookSchemaType = useMemo(
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

  type RulebookSchema = Static<typeof RulebookSchemaType>

  const { cache } = useSWRConfig()

  const onSubmit: PageFormSubmitHandler<RulebookSchema> = async (rulebook, setError) => {
    try {
      if (Number.isInteger(id)) {
        rulebook = await requestPatch<EdaRulebook>(`/api/rulebooks/${id}`, rulebook)
        ;(cache as unknown as { clear: () => void }).clear?.()
        navigate(-1)
      } else {
        const newRulebook = await requestPost<EdaRulebook>('/api/rulebooks', rulebook)
        ;(cache as unknown as { clear: () => void }).clear?.()
        navigate(RouteE.EdaRulebookDetails.replace(':id', newRulebook.id.toString()))
      }
    } catch (err) {
      setError('TODO')
    }
  }
  const onCancel = () => navigate(-1)

  if (Number.isInteger(id)) {
    if (!rulebook) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Rulebooks'), to: RouteE.EdaRulebooks },
              { label: t('Edit rulebook') },
            ]}
          />
        </PageLayout>
      )
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit rulebook')}
            breadcrumbs={[
              { label: t('Rulebooks'), to: RouteE.EdaRulebooks },
              { label: t('Edit rulebook') },
            ]}
          />
          <PageBody>
            <PageForm
              schema={RulebookSchemaType}
              submitText={t('Save rulebook')}
              onSubmit={onSubmit}
              cancelText={t('Cancel')}
              onCancel={onCancel}
              defaultValue={rulebook}
            />
          </PageBody>
        </PageLayout>
      )
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create rulebook')}
          breadcrumbs={[
            { label: t('Rulebooks'), to: RouteE.EdaRulebooks },
            { label: t('Create rulebook') },
          ]}
        />
        <PageBody>
          <PageForm
            schema={RulebookSchemaType}
            submitText={t('Create rulebook')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
          />
        </PageBody>
      </PageLayout>
    )
  }
}
