import { ajvResolver } from '@hookform/resolvers/ajv'

import {
  ActionGroup,
  Alert,
  Button,
  Form,
  Grid,
  gridItemSpanValueShape,
  Tooltip,
} from '@patternfly/react-core'
import * as Ajv from 'ajv'
import { JSONSchema6 } from 'json-schema'
import { CSSProperties, ReactNode, useContext, useState } from 'react'
import {
  DeepPartial,
  ErrorOption,
  FieldPath,
  FieldValues,
  FormProvider,
  useForm,
  useFormState,
} from 'react-hook-form'
import { Scrollable } from '../components/Scrollable'
import { useBreakpoint } from '../components/useBreakPoint'
import { SettingsContext } from '../Settings'

export function PageForm<T extends object>(props: {
  schema?: JSONSchema6
  children?: ReactNode
  submitText: string
  onSubmit: PageFormSubmitHandler<T>
  cancelText: string
  onCancel?: () => void
  defaultValue?: DeepPartial<T>
  isVertical?: boolean
  singleColumn?: boolean
  disableScrolling?: boolean
}) {
  const { schema, defaultValue } = props
  const form = useForm<T>({
    defaultValues: defaultValue ?? ({} as DeepPartial<T>),
    resolver: schema
      ? ajvResolver(
          schema as Ajv.JSONSchemaType<T>,
          { strict: false, addFormats: true } as Ajv.Options
        )
      : undefined,
  })

  const { handleSubmit, setError: setFieldError } = form
  const [error, setError] = useState('')
  const isMd = useBreakpoint('md')
  const [settings] = useContext(SettingsContext)
  const isHorizontal = props.isVertical ? false : settings.formLayout === 'horizontal'
  const multipleColumns = props.singleColumn ? false : settings.formColumns === 'multiple'

  const sm: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 12 : 12) : 12
  const md: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 12 : 6) : 12
  const lg: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 6 : 6) : 12
  const xl: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 6 : 6) : 12
  const xl2: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 4 : 4) : 12
  const maxWidth: number | undefined = multipleColumns ? undefined : isHorizontal ? 960 : 800

  return (
    // <PageBody>
    <FormProvider {...form}>
      <Form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(async (data) => {
          setError('')
          try {
            await props.onSubmit(data, setError, setFieldError)
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
          }
        })}
        isHorizontal={isHorizontal}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: props.disableScrolling ? undefined : 'hidden',
          gap: 0,
        }}
      >
        {props.disableScrolling ? (
          <div style={{ maxWidth, padding: 24 }}>
            <Grid hasGutter span={12} sm={sm} md={md} lg={lg} xl={xl} xl2={xl2}>
              {props.children}
            </Grid>
          </div>
        ) : (
          <Scrollable style={{ height: '100%', flexGrow: 1 }}>
            <div style={{ maxWidth, padding: 24 }}>
              <Grid hasGutter span={12} sm={sm} md={md} lg={lg} xl={xl} xl2={xl2}>
                {props.children}
              </Grid>
            </div>
          </Scrollable>
        )}
        {error && (
          <Alert
            variant="danger"
            title={error ?? ''}
            isInline
            style={{ paddingLeft: isMd && props.onCancel ? 190 : undefined }}
          />
        )}
        {props.onCancel ? (
          <div
            style={{
              backgroundColor:
                settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--400)' : undefined,
              padding: 24,
            }}
          >
            <ActionGroup style={{ marginTop: 0 }}>
              <PageFormSubmitButton>{props.submitText}</PageFormSubmitButton>
              {props.onCancel && (
                <PageFormCancelButton onCancel={props.onCancel}>
                  {props.cancelText}
                </PageFormCancelButton>
              )}
            </ActionGroup>
          </div>
        ) : (
          <PageFormSubmitButton style={{ marginTop: 48 }}>{props.submitText}</PageFormSubmitButton>
        )}
      </Form>
    </FormProvider>
    // </PageBody>
  )
}

export type PageFormSubmitHandler<T extends FieldValues> = (
  data: T,
  setError: (error: string) => void,
  setFieldError: (fieldName: FieldPath<T>, error: ErrorOption) => void
) => Promise<unknown>

export function PageFormSubmitButton(props: { children: ReactNode; style?: CSSProperties }) {
  const { isSubmitting, errors } = useFormState()
  const hasErrors = errors && Object.keys(errors).length > 0
  return (
    <Tooltip content="Please fix errors" trigger={hasErrors ? undefined : 'manual'}>
      <Button
        type="submit"
        isDisabled={isSubmitting}
        isLoading={isSubmitting}
        isDanger={hasErrors}
        variant={hasErrors ? 'secondary' : undefined}
        style={props.style}
      >
        {props.children}
      </Button>
    </Tooltip>
  )
}

export function PageFormCancelButton(props: { onCancel: () => void; children: ReactNode }) {
  return (
    <Button type="button" variant="link" onClick={props.onCancel}>
      {props.children}
    </Button>
  )
}
