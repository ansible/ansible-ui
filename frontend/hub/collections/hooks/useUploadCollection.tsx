import { FileUpload, FormGroup, Modal, ModalVariant } from '@patternfly/react-core'
import { Type } from '@sinclair/typebox'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageForm, usePageDialog } from '../../../../framework'
import { useGet } from '../../../common/useItem'
import { Namespace } from '../../namespaces/Namespace'
import { HubItemsResponse } from '../../useHubView'

export interface FileUploadModalProps {
  title: string
  onClose?: (data?: string) => void
}

function useNamespaces() {
  const t = useGet<HubItemsResponse<Namespace>>('/api/automation-hub/_ui/v1/namespaces/')
  return t.data?.data
}

function FileUploadModal(props: FileUploadModalProps) {
  const [_dialog, setDialog] = usePageDialog()
  const { t } = useTranslation()

  const [value, setValue] = useState('')
  const [filename, setFilename] = useState('')
  // const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const namespaces = useNamespaces()
  // const namespaces: Namespace[] = []

  const handleFileInputChange = useCallback((_, file: File) => {
    setFilename(file.name)
  }, [])

  const handleTextOrDataChange = (value: string) => {
    setValue(value)
  }

  const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setFilename('')
    setValue('')
  }

  const handleFileReadStarted = (_fileHandle: File) => {
    setIsLoading(true)
  }

  const handleFileReadFinished = (_fileHandle: File) => {
    setIsLoading(false)
    // setIsLoaded(true)
  }

  const onConfirm = () => {
    // setDialog(undefined)
    // props.onClose?.(value)
  }

  const onClose = () => {
    setDialog(undefined)
    props.onClose?.()
  }

  const inputType = useMemo(
    () =>
      Type.Object({
        namespace: Type.String({
          title: t('Namespace'),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          placeholder: t('Select a namespace'),
          variant: 'select',
          options: namespaces?.map((namespace) => ({
            label: namespace.name,
            description: namespace.description,
            value: namespace.name,
          })),
          minLength: 1,
          errorMessage: { minLength: t('Name is required') },
        }),
      }),
    [namespaces, t]
  )

  return (
    <Modal
      title={props.title}
      variant={ModalVariant.medium}
      isOpen
      onClose={onClose}
      hasNoBodyWrapper
      aria-label="TODO"
    >
      {namespaces ? (
        <PageForm
          isVertical
          schema={inputType}
          submitText={t('Confirm')}
          cancelText={t('Cancel')}
          onCancel={onClose}
          onSubmit={(data) => {
            alert(JSON.stringify(data))
            onConfirm()
            return Promise.resolve()
          }}
          disableScrolling
        >
          <FormGroup
            label={t('Collection file')}
            // helperTextInvalid={errorMessage}
            // helperText={props.helperText}
            isRequired={true}
            // validated={errorMessage ? 'error' : undefined}
          >
            <FileUpload
              id="file-upload"
              type="dataURL"
              value={value}
              filename={filename}
              filenamePlaceholder={t('Drag and drop a collection tar file or upload one')}
              onFileInputChange={handleFileInputChange}
              onDataChange={handleTextOrDataChange}
              onTextChange={handleTextOrDataChange}
              onReadStarted={handleFileReadStarted}
              onReadFinished={handleFileReadFinished}
              onClearClick={handleClear}
              isLoading={isLoading}
              allowEditingUploadedText={false}
              browseButtonText={t('Upload')}
            />
          </FormGroup>
        </PageForm>
      ) : (
        <div>{t('Loading')}</div>
      )}
    </Modal>
  )
}

export function useUploadCollection() {
  const [_, setDialog] = usePageDialog()
  const [props, setProps] = useState<FileUploadModalProps>()
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined)
        props.onClose?.()
      }
      setDialog(<FileUploadModal {...props} onClose={onCloseHandler} />)
    } else {
      setDialog(undefined)
    }
  }, [props, setDialog])
  return setProps
}
