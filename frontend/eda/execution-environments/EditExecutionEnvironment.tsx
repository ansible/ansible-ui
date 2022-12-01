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
import { EdaExecutionEnvironment } from '../interfaces/EdaExecutionEnvironment'

export function EditExecutionEnvironment() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const id = Number(params.id)
  const { data: executionEnvironment } = useGet<EdaExecutionEnvironment>(
    `/api/executionEnvironments/${id.toString()}`
  )

  const ExecutionEnvironmentSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
      }),
    [t]
  )

  type ExecutionEnvironmentSchema = Static<typeof ExecutionEnvironmentSchemaType>

  const { cache } = useSWRConfig()

  const onSubmit: PageFormSubmitHandler<ExecutionEnvironmentSchema> = async (
    executionEnvironment,
    setError
  ) => {
    try {
      if (Number.isInteger(id)) {
        executionEnvironment = await requestPatch<EdaExecutionEnvironment>(
          `/api/executionEnvironments/${id}`,
          executionEnvironment
        )
        ;(cache as unknown as { clear: () => void }).clear?.()
        navigate(-1)
      } else {
        const newExecutionEnvironment = await requestPost<EdaExecutionEnvironment>(
          '/api/executionEnvironments',
          executionEnvironment
        )
        ;(cache as unknown as { clear: () => void }).clear?.()
        navigate(
          RouteE.EdaExecutionEnvironmentDetails.replace(
            ':id',
            newExecutionEnvironment.id.toString()
          )
        )
      }
    } catch (err) {
      setError('TODO')
    }
  }
  const onCancel = () => navigate(-1)

  if (Number.isInteger(id)) {
    if (!executionEnvironment) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('ExecutionEnvironments'), to: RouteE.EdaExecutionEnvironments },
              { label: t('Edit execution environment') },
            ]}
          />
        </PageLayout>
      )
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit execution environment')}
            breadcrumbs={[
              { label: t('ExecutionEnvironments'), to: RouteE.EdaExecutionEnvironments },
              { label: t('Edit execution environment') },
            ]}
          />
          <PageBody>
            <PageForm
              schema={ExecutionEnvironmentSchemaType}
              submitText={t('Save execution environment')}
              onSubmit={onSubmit}
              cancelText={t('Cancel')}
              onCancel={onCancel}
              defaultValue={executionEnvironment}
            />
          </PageBody>
        </PageLayout>
      )
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create execution environment')}
          breadcrumbs={[
            { label: t('ExecutionEnvironments'), to: RouteE.EdaExecutionEnvironments },
            { label: t('Create execution environment') },
          ]}
        />
        <PageBody>
          <PageForm
            schema={ExecutionEnvironmentSchemaType}
            submitText={t('Create execution environment')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
          />
        </PageBody>
      </PageLayout>
    )
  }
}
