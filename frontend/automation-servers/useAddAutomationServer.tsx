import { Modal, ModalVariant } from '@patternfly/react-core'
import { Static, Type } from '@sinclair/typebox'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PageForm, usePageDialog } from '../../framework'
import { useAutomationServers } from './AutomationServerProvider'

export function useAddAutomationServer() {
  const [_, setDialog] = usePageDialog()
  const addAutomationServer = useCallback(
    () => setDialog(<AddAutomationServerDialog />),
    [setDialog]
  )
  return addAutomationServer
}

export function AddAutomationServerDialog() {
  const { t } = useTranslation()

  const DataType = Type.Object({
    name: Type.String({
      title: t('Name'),
      placeholder: t('Enter a friendly name for the automation server'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      minLength: 1,
      errorMessage: { required: t('Name is required'), minLength: t('Name is required') },
    }),
    url: Type.String({
      title: t('Url'),
      placeholder: t('Enter the url of the automation server'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      minLength: 1,
      errorMessage: { required: t('Url is required'), minLength: t('Url is required') },
    }),
    type: Type.String({
      title: t('Automation type'),
      placeholder: t('Select automation type'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      minLength: 1,
      errorMessage: {
        required: t('Automation type is required'),
        minLength: t('Automation type is required'),
      },
      variant: 'select',
      options: [
        {
          label: t('Automation controller'),
          description: t('Define, operate, scale, and delegate automation across your enterprise.'),
          value: 'controller',
        },
        {
          label: t('Automation hub'),
          description: t('Discover, publish, and manage your Ansible Collections.'),
          value: 'hub',
        },
        {
          label: t('Event driven'),
          // description: t('Discover, publish, and manage your Ansible Collections.'),
          value: 'eda',
        },
      ],
    }),
  })

  type Data = Static<typeof DataType>

  const { setAutomationServers } = useAutomationServers()

  const [_, setDialog] = usePageDialog()
  const onClose = () => setDialog(undefined)
  const onSubmit = (data: Data) => {
    setAutomationServers((servers) => [...servers.filter((a) => a.url !== data.url), data])
    onClose()
    return Promise.resolve()
  }

  return (
    <Modal title={t('Add automation server')} isOpen onClose={onClose} variant={ModalVariant.small}>
      <PageForm
        schema={DataType}
        submitText={t('Add automation server')}
        cancelText={t('Cancel')}
        onSubmit={onSubmit}
        defaultValue={{ type: 'controller' }}
        singleColumn
        disableScrolling
      />
    </Modal>
  )
}
