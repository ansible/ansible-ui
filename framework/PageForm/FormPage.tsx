import { Form, FormSection, PageSection } from '@patternfly/react-core'
import { Children, isValidElement, ReactNode, useContext } from 'react'
import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form'
import { PartialDeep } from 'type-fest'
import { Scrollable } from '../components/Scrollable'
import { PageHeader, PageHeaderProps } from '../PageHeader'
import { SettingsContext } from '../Settings'
import { PageFormAlerts } from './PageFormAlerts'
import { PageFormButtons } from './PageFormButtons'

export type FormPageProps<T extends object> = PageHeaderProps & {
  children?: ReactNode
  defaultValues?: PartialDeep<T>
  onSubmit: SubmitHandler<PartialDeep<T>>
  schema?: unknown
  isVertical?: boolean
  onCancel?: () => void
  submitText?: string
  hideHeader?: boolean
  noPadding?: boolean
  form: UseFormReturn
}
export function FormPage<T extends object>(props: FormPageProps<T>) {
  // const methods = useForm<PartialDeep<T>>({
  //     defaultValues: props.defaultValues,
  //     resolver: ajvResolver(props.schema, { strict: false }),
  // })

  const children = Children.toArray(props.children)

  const inputs = children.filter((child) => {
    if (!isValidElement(child)) return false
    if (child.type === PageFormAlerts) return false
    if (child.type === PageFormButtons) return false
    return true
  })

  const buttons = children.find((child) => {
    if (!isValidElement(child)) return false
    if (child.type === PageFormButtons) return true
    return false
  })

  const [settings] = useContext(SettingsContext)

  return (
    <>
      {!props.hideHeader && <PageHeader {...props} />}
      {/* <FormProvider {...methods}> */}
      <Form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={props.form.handleSubmit(props.onSubmit as SubmitHandler<FieldValues>)}
        isHorizontal={props.isVertical ? false : settings.formLayout === 'horizontal'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <Scrollable style={{ height: '100%', flexGrow: 1 }}>
          <PageSection
            padding={{ default: props.noPadding ? 'noPadding' : 'padding' }}
            isWidthLimited
          >
            <FormSection>{inputs}</FormSection>
          </PageSection>
        </Scrollable>
        {buttons}
      </Form>
      {/* </FormProvider> */}
    </>
  )
}
