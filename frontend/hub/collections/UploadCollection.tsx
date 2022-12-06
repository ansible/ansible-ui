import { Static, Type } from '@sinclair/typebox'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  PageBody,
  PageForm,
  PageFormSelectOption,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../framework'
import { LoadingPage } from '../../../framework/components/LoadingPage'
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload'
import { requestPostFile } from '../../Data'
import { RouteE } from '../../Routes'
import { useNamespaces } from '../namespaces/hooks/useNamespaces'
import { useRepositories } from '../repositories/hooks/useRepositories'

const UploadSchema = Type.Object({
  namespace: Type.String(),
  file: Type.String(),
})
type UploadData = Static<typeof UploadSchema>

export function UploadCollection() {
  const { t } = useTranslation()
  return (
    <PageLayout>
      <PageHeader
        title={t('Upload collection')}
        breadcrumbs={[
          { label: t('Collections'), to: RouteE.Collections },
          { label: t('Upload collection') },
        ]}
      />
      <PageTabs>
        <PageTab title={t('Upload file')}>
          <UploadCollectionByFile />
        </PageTab>
      </PageTabs>
    </PageLayout>
  )
}

export function UploadCollectionByFile() {
  const { t } = useTranslation()
  const namespaces = useNamespaces()
  const repositories = useRepositories()
  const navigate = useNavigate()
  const onCancel = () => navigate(-1)
  return (
    <>
      {namespaces === undefined || repositories === undefined ? (
        <LoadingPage />
      ) : (
        <PageBody>
          <PageForm<UploadData>
            schema={UploadSchema}
            submitText={t('Confirm')}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            onSubmit={(data) => {
              return requestPostFile(
                '/api/automation-hub/content/inbound-ansible/v3/artifacts/collections/',
                data.file
              )
            }}
          >
            <PageFormSelectOption
              label={t('Namespace')}
              name="namespace"
              isRequired
              options={namespaces.map((namespace) => ({
                label: namespace.name,
                description: namespace.description,
                value: namespace.name,
              }))}
            />
            <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
          </PageForm>
        </PageBody>
      )}
    </>
  )
}
