import { ajvResolver } from '@hookform/resolvers/ajv'
import {
    ActionGroup,
    Alert,
    Button,
    Checkbox,
    Form,
    FormGroup,
    FormSection,
    InputGroup,
    Menu,
    MenuItem,
    PageSection,
    Select,
    SelectOption,
    SelectVariant,
    TextArea,
    TextInput,
    TextInputGroup,
    TextInputGroupMain,
    TextInputGroupUtilities,
    Tooltip,
} from '@patternfly/react-core'
import { CaretDownIcon, SearchIcon } from '@patternfly/react-icons'
import { JSONSchema6 } from 'json-schema'
import { Children, CSSProperties, Fragment, isValidElement, ReactNode, useState } from 'react'
import {
    DeepPartial,
    ErrorOption,
    FormProvider,
    SubmitHandler,
    useController,
    useForm,
    useFormContext,
    UseFormReturn,
    useFormState,
} from 'react-hook-form'
import { PartialDeep } from 'type-fest'
import { Collapse, PageHeader, PageHeaderProps, useWindowSizeOrLarger, WindowSize } from '../../framework'
import { Scrollable } from '../../framework/components/Scrollable'
import { Organization } from '../controller/access/organizations/Organization'
import { SelectDialog } from '../controller/SelectDialog'

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
        if (child.type === FormPageAlerts) return false
        if (child.type === FormPageButtons) return false
        return true
    })

    const buttons = children.find((child) => {
        if (!isValidElement(child)) return false
        if (child.type === FormPageButtons) return true
        return false
    })

    return (
        <>
            {!props.hideHeader && <PageHeader {...props} />}
            {/* <FormProvider {...methods}> */}
            <Form
                onSubmit={props.form.handleSubmit(props.onSubmit)}
                isHorizontal={props.isVertical ? false : true}
                style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}
            >
                <Scrollable style={{ height: '100%', flexGrow: 1 }}>
                    <PageSection padding={{ default: props.noPadding ? 'noPadding' : 'padding' }} isWidthLimited>
                        <FormSection>{inputs}</FormSection>
                    </PageSection>
                </Scrollable>
                {buttons}
            </Form>
            {/* </FormProvider> */}
        </>
    )
}

export function FormPageAlerts() {
    const { errors } = useFormState()
    const sm = useWindowSizeOrLarger(WindowSize.md)
    return (
        <Fragment>
            {errors && Object.keys(errors).length > 0 && (
                <Alert
                    title="Please fix validation errors."
                    isInline
                    style={{ width: '100%', paddingLeft: sm ? 190 : undefined }}
                    variant="danger"
                >
                    {/* {process.env.NODE_ENV === 'development' && errors[Object.keys(errors)[0]].message} */}
                </Alert>
            )}
        </Fragment>
    )
}

export function FormPageButtons(props: { submitText: string; onCancel: () => void }) {
    const { errors } = useFormState()

    return (
        <div>
            <FormPageAlerts />
            <PageSection
                isFilled
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '100%',
                    borderTop: 'thin solid var(--pf-global--BorderColor--100)',
                }}
                variant="light"
            >
                <ActionGroup style={{ marginTop: 0 }}>
                    {errors && Object.keys(errors).length > 0 ? (
                        <Tooltip content={'Please fix validation errors'}>
                            <Button type="submit" isAriaDisabled>
                                {props.submitText}
                            </Button>
                        </Tooltip>
                    ) : (
                        <Button type="submit">{props.submitText}</Button>
                    )}

                    <Button type="button" variant="link" onClick={props.onCancel}>
                        Cancel
                    </Button>
                </ActionGroup>
            </PageSection>
        </div>
    )
}

export function FormInputCheckbox(props: {
    label: string
    name: string
    helperText?: string
    required?: boolean
    description?: ReactNode
    body?: ReactNode
}) {
    const { control } = useFormContext()
    const { field } = useController({ control, name: props.name })
    const id = props.name
    return (
        <Checkbox
            label={props.label}
            id={id}
            aria-describedby={`${id}-helper`}
            description={props.description}
            body={field.value ? props.body : undefined}
            {...field}
            isChecked={field.value}
        />
    )
}

export function FormTextInput(props: {
    id?: string
    label: string
    name: string
    helperText?: string
    required?: boolean
    secret?: boolean
    autoFocus?: boolean
    placeholder?: string
}) {
    const {
        register,
        formState: { isSubmitting },
    } = useFormContext()
    const registration = register(props.name)
    const { fieldState } = useController({ name: props.name })
    const error = fieldState.error
    const id = props.id ?? props.name
    return (
        <FormGroup
            id={`${id}-form-group`}
            fieldId={id}
            label={props.label}
            helperText={props.helperText}
            isRequired={props.required}
            validated={error?.message ? 'error' : undefined}
            helperTextInvalid={error?.message}
        >
            <TextInput
                id={id}
                type={props.secret ? 'password' : 'text'}
                aria-describedby={`${id}-form-group`}
                isRequired={props.required}
                validated={error?.message ? 'error' : undefined}
                autoFocus={props.autoFocus}
                placeholder={props.placeholder}
                {...registration}
                onChange={(v, e) => {
                    void registration.onChange(e)
                }}
                // innerRef={registration.ref}
                isReadOnly={isSubmitting}
            />
        </FormGroup>
    )
}

export function FormTextArea(props: {
    id?: string
    label: string
    name: string
    helperText?: string
    required?: boolean
    secret?: boolean
    autoFocus?: boolean
    placeholder?: string
}) {
    const {
        register,
        formState: { isSubmitting },
    } = useFormContext()
    const registration = register(props.name)
    const { fieldState } = useController({ name: props.name })
    const error = fieldState.error
    const id = props.id ?? props.name
    return (
        <FormGroup
            id={`${id}-form-group`}
            fieldId={id}
            label={props.label}
            helperText={props.helperText}
            isRequired={props.required}
            validated={error?.message ? 'error' : undefined}
            helperTextInvalid={error?.message}
        >
            <TextArea
                id={id}
                type={props.secret ? 'password' : 'text'}
                aria-describedby={`${id}-form-group`}
                isRequired={props.required}
                validated={error?.message ? 'error' : undefined}
                autoFocus={props.autoFocus}
                placeholder={props.placeholder}
                {...registration}
                onChange={(v, e) => {
                    void registration.onChange(e)
                }}
                resizeOrientation="vertical"
                isReadOnly={isSubmitting}
                // innerRef={registration.ref}
            />
        </FormGroup>
    )
}

export function FormSelect(props: {
    label: string
    name: string
    helperText?: string
    required?: boolean
    children?: ReactNode
    footer?: ReactNode
    isCreatable?: boolean
}) {
    const { control } = useFormContext()
    const {
        field,
        fieldState: { error },
    } = useController({ control, name: props.name })

    const [open, setOpen] = useState(false)
    const id = props.name
    let errorMessage: string | undefined
    switch (error?.type) {
        case 'required':
            errorMessage = props.label + ' is required.'
            break
        default:
            errorMessage = error?.type
            break
    }
    return (
        <FormGroup
            fieldId={id}
            label={props.label}
            helperTextInvalid={errorMessage}
            helperText={props.helperText}
            isRequired={props.required}
            validated={errorMessage ? 'error' : undefined}
        >
            <Select
                id={id}
                variant={SelectVariant.typeahead}
                aria-describedby={`${id}-helper`}
                validated={errorMessage ? 'error' : undefined}
                {...field}
                isOpen={open}
                onToggle={() => setOpen(!open)}
                selections={field.value}
                onSelect={(_e, v) => {
                    field.onChange(v)
                    setOpen(false)
                }}
                footer={props.footer}
                isCreatable={props.isCreatable}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {props.children as unknown as any}
            </Select>
        </FormGroup>
    )
}

export function FormSelectInput(props: {
    label: string
    name: string
    helperText?: string
    required?: boolean
    children?: ReactNode
    footer?: ReactNode
}) {
    const { control } = useFormContext()
    const {
        field,
        fieldState: { error },
    } = useController({ control, name: props.name })

    const menuItems = Children.toArray(props.children)
        .filter((child) => isValidElement(child) && child.type === SelectOption)
        .map((child) => {
            if (isValidElement(child) && child.type === SelectOption) {
                return <MenuItem>{child.props.children}</MenuItem>
            }
            return <></>
        })

    const [open, setOpen] = useState(false)
    const id = props.name
    let errorMessage: string | undefined
    switch (error?.type) {
        case 'required':
            errorMessage = props.label + ' is required.'
            break
        default:
            errorMessage = error?.type
            break
    }
    return (
        <FormGroup
            fieldId={id}
            label={props.label}
            helperTextInvalid={errorMessage}
            helperText={props.helperText}
            isRequired={props.required}
            validated={errorMessage ? 'error' : undefined}
        >
            <TextInputGroup>
                <TextInputGroupMain {...field}></TextInputGroupMain>
                <TextInputGroupUtilities>
                    {/* <Button variant="plain" onClick={() => {}} aria-label="Clear button and input">
                        <TimesIcon />
                    </Button> */}
                    <Button variant="plain" onClick={() => setOpen(!open)} aria-label="Options menu">
                        <CaretDownIcon />
                    </Button>
                </TextInputGroupUtilities>
                {open && <Menu style={{ position: 'absolute', right: 0, top: 36, width: '100%' }}>{menuItems}</Menu>}
            </TextInputGroup>
        </FormGroup>
    )
}

export function FormTextSelect(props: {
    id?: string
    label: string
    name: string
    helperText?: string
    required?: boolean
    secret?: boolean
    autoFocus?: boolean
    placeholder?: string
}) {
    const {
        register,
        setValue,
        formState: { isSubmitting },
    } = useFormContext()
    const registration = register(props.name)
    const { fieldState } = useController({ name: props.name })
    const error = fieldState.error
    const id = props.id ?? props.name
    const [open, setOpen] = useState(false)
    return (
        <Fragment>
            <FormGroup
                id={`${id}-form-group`}
                fieldId={id}
                label={props.label}
                helperText={props.helperText}
                isRequired={props.required}
                validated={error?.message ? 'error' : undefined}
                helperTextInvalid={error?.message}
            >
                <InputGroup>
                    <TextInput
                        id={id}
                        type={props.secret ? 'password' : 'text'}
                        aria-describedby={`${id}-form-group`}
                        isRequired={props.required}
                        validated={error?.message ? 'error' : undefined}
                        autoFocus={props.autoFocus}
                        placeholder={props.placeholder}
                        {...registration}
                        onChange={(v, e) => {
                            void registration.onChange(e)
                        }}
                        // innerRef={registration.ref}
                        isReadOnly={isSubmitting}
                    />
                    <Button variant="control" onClick={() => setOpen(!open)} aria-label="Options menu" isDisabled={isSubmitting}>
                        <SearchIcon />
                    </Button>
                </InputGroup>
            </FormGroup>
            <SelectDialog
                open={open}
                setOpen={setOpen}
                onClick={(organization: Organization) => {
                    setValue(props.name, organization.name, { shouldValidate: true })
                }}
            />
        </Fragment>
    )
}

export function FormSchema(props: { schema: JSONSchema6; base?: string }) {
    const { schema } = props
    const base = props.base ? props.base + '.' : ''

    const p: ReactNode[] = []

    for (const propertyName in schema.properties) {
        const property = schema.properties[propertyName]

        switch (property) {
            case true:
            case false:
                continue
        }

        const title = typeof property.title === 'string' ? property.title : propertyName

        let placeholder: string | undefined = (property as { placeholder?: string }).placeholder
        placeholder = typeof placeholder === 'string' ? placeholder : undefined

        const required = Array.isArray(schema.required) && schema.required.includes(propertyName)

        switch (property.type) {
            case 'string': {
                if ((property as { variant?: string }).variant === 'select') {
                    p.push(
                        <FormTextSelect
                            key={base + propertyName}
                            name={base + propertyName}
                            label={title}
                            placeholder={placeholder}
                            required={required}
                        />
                    )
                } else if ((property as { variant?: string }).variant === 'textarea') {
                    p.push(
                        <FormTextArea
                            key={base + propertyName}
                            name={base + propertyName}
                            label={title}
                            placeholder={placeholder}
                            required={required}
                        />
                    )
                } else if ((property as { variant?: string }).variant === 'password') {
                    p.push(
                        <FormTextInput
                            key={base + propertyName}
                            name={base + propertyName}
                            label={title}
                            placeholder={placeholder}
                            required={required}
                            secret
                        />
                    )
                } else {
                    p.push(
                        <FormTextInput
                            key={base + propertyName}
                            name={base + propertyName}
                            label={title}
                            placeholder={placeholder}
                            required={required}
                        />
                    )
                }
                break
            }
            case 'object':
                p.push(<FormSchema key={propertyName} schema={property} base={base + propertyName} />)
                break
        }
    }

    return <>{p}</>
}

export function PageForm<T extends object>(props: {
    schema?: JSONSchema6
    children?: ReactNode
    submitText: string
    onSubmit: FormPageSubmitHandler<T>
    cancelText: string
    onCancel?: () => void
    defaultValue?: DeepPartial<T>
    isVertical?: boolean
}) {
    const { schema, defaultValue } = props
    const form = useForm<T>({
        defaultValues: defaultValue ?? ({} as DeepPartial<T>),
        resolver: schema ? ajvResolver(schema, { strict: false } as unknown) : undefined,
    })

    const { handleSubmit, setError: setFieldError } = form
    const [error, setError] = useState('')
    const sm = useWindowSizeOrLarger(WindowSize.md)
    return (
        <FormProvider {...form}>
            <Form
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onSubmit={handleSubmit((data) => {
                    setError('')
                    return props.onSubmit(data, setError, setFieldError)
                })}
                isHorizontal={!props.isVertical}
                style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden', gap: 0 }}
            >
                <Scrollable style={{ height: '100%', flexGrow: 1 }}>
                    <PageSection isFilled padding={{ default: props.onCancel ? 'padding' : 'noPadding' }}>
                        <FormSection style={{ maxWidth: 800 }}>
                            {props.schema && <FormSchema schema={props.schema} />}
                            {props.children}
                        </FormSection>
                    </PageSection>
                </Scrollable>
                <Collapse open={!!error}>
                    <Alert variant="danger" title={error ?? ''} isInline style={{ paddingLeft: sm && props.onCancel ? 190 : undefined }} />
                </Collapse>
                {props.onCancel ? (
                    <PageSection isFilled={false} style={{ borderTop: 'thin solid var(--pf-global--BorderColor--100)' }} variant="light">
                        <ActionGroup style={{ marginTop: 0 }}>
                            <PageFormSubmitButton>{props.submitText}</PageFormSubmitButton>
                            {props.onCancel && <PageFormCancelButton onCancel={props.onCancel}>{props.cancelText}</PageFormCancelButton>}
                        </ActionGroup>
                    </PageSection>
                ) : (
                    <PageFormSubmitButton style={{ marginTop: 48 }}>{props.submitText}</PageFormSubmitButton>
                )}
            </Form>
        </FormProvider>
    )
}

export type FormPageSubmitHandler<T> = (
    data: T,
    setError: (error: string) => void,
    setFieldError: (fieldName: string, error: ErrorOption) => void
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
