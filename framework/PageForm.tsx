import { ajvResolver } from '@hookform/resolvers/ajv'

import {
    ActionGroup,
    Alert,
    Button,
    Checkbox,
    Form,
    FormGroup,
    FormSection,
    Grid,
    gridItemSpanValueShape,
    InputGroup,
    Menu,
    MenuItem,
    PageSection,
    Select,
    SelectGroup,
    SelectOption,
    SelectOptionObject,
    SelectVariant,
    TextArea,
    TextInput,
    TextInputGroup,
    TextInputGroupMain,
    TextInputGroupUtilities,
    Tooltip,
} from '@patternfly/react-core'
import { CaretDownIcon, EyeIcon, EyeSlashIcon, SearchIcon } from '@patternfly/react-icons'
import * as Ajv from 'ajv'
import deepEqual from 'fast-deep-equal'
import { JSONSchema6 } from 'json-schema'
import { Children, CSSProperties, Fragment, isValidElement, ReactNode, useCallback, useContext, useState } from 'react'
import {
    DeepPartial,
    ErrorOption,
    FieldPath,
    FieldValues,
    FormProvider,
    SubmitHandler,
    useController,
    useForm,
    useFormContext,
    UseFormReturn,
    useFormState,
} from 'react-hook-form'
import { PartialDeep } from 'type-fest'
import { Collapse, PageHeader, PageHeaderProps, useBreakpoint } from '.'
import { Organization } from '../frontend/controller/access/organizations/Organization'
import { Scrollable } from './components/Scrollable'
import { SettingsContext } from './Settings'

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

    const [settings] = useContext(SettingsContext)

    return (
        <>
            {!props.hideHeader && <PageHeader {...props} />}
            {/* <FormProvider {...methods}> */}
            <Form
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onSubmit={props.form.handleSubmit(props.onSubmit as SubmitHandler<FieldValues>)}
                isHorizontal={props.isVertical ? false : settings.formLayout === 'horizontal'}
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
    const isMd = useBreakpoint('md')
    return (
        <Fragment>
            {errors && Object.keys(errors).length > 0 && (
                <Alert
                    title="Please fix validation errors."
                    isInline
                    style={{ width: '100%', paddingLeft: isMd ? 190 : undefined }}
                    variant="danger"
                >
                    {/* {process.env.NODE_ENV === 'development' && errors[Object.keys(errors)[0]].message} */}
                </Alert>
            )}
        </Fragment>
    )
}

export function FormPageButtons(props: { submitText: string; cancelText: string; onCancel: () => void }) {
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
                        {props.cancelText}
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
            isChecked={!!field.value}
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
    const [showSecret, setShowSecret] = useState(false)
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
            <InputGroup>
                <TextInput
                    id={id}
                    type={props.secret && !showSecret ? 'password' : 'text'}
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
                {props.secret && (
                    <Button
                        variant="control"
                        onClick={() => setShowSecret(!showSecret)}
                        aria-label="Options menu"
                        isDisabled={isSubmitting}
                    >
                        {showSecret ? <EyeIcon /> : <EyeSlashIcon />}
                    </Button>
                )}
            </InputGroup>
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

export interface FormInputPopover {
    title?: string
    body?: string[]
    link?: { label: string; url: string }
}

export interface FormSelectOption<T> {
    group?: string
    label: string
    description?: string
    value: T
}

export interface FormSelectProps<T> {
    id?: string
    name: string
    label: string
    popover?: FormInputPopover
    placeholder?: string
    help?: string
    required?: boolean
    footer?: {
        label?: string
        click?: () => void
    }
    create?: boolean
    options: FormSelectOption<T>[]
}

export function FormSelect<T>(props: FormSelectProps<T>) {
    const {
        field,
        fieldState: { error: fieldError },
    } = useController({ name: props.name })
    const [open, setOpen] = useState(false)
    const id = props.id ?? props.name
    const error = fieldError !== undefined && fieldError.message

    const { options } = props
    options.sort((l, r) => {
        if ((l.group ?? '') < (r.group ?? '')) return -1
        if ((l.group ?? '') > (r.group ?? '')) return 1
        if (l.label < r.label) return -1
        if (l.label > r.label) return 1
        return 0
    })
    const selectedIndex = options.findIndex((option) => deepEqual(option.value, field.value))
    const groups = options.reduce<
        Record<
            string,
            {
                group?: string
                label: string
                description?: string
                value: T
            }[]
        >
    >((groups, option) => {
        const group = option.group ?? ''
        let optionsArray = groups[group]
        if (!optionsArray) {
            optionsArray = []
            groups[group] = optionsArray
        }
        optionsArray.push(option)
        return groups
    }, {})
    const isGrouped = Object.keys(groups).length > 1 || (Object.keys(groups).length === 1 && Object.keys(groups)[0] !== '')

    const onSelect = useCallback(
        (_event, value: string | SelectOptionObject) => {
            if (typeof value !== 'string') {
                value = value.toString()
            }
            const selectedIndex = Number(value)
            const selected = options[selectedIndex].value
            field.onChange(selected)
            setOpen(false)
        },
        [field, options]
    )
    let index = 0
    return (
        <FormGroup
            id={`${id}-form-group`}
            fieldId={id}
            label={props.label}
            helperTextInvalid={error}
            helperText={props.help}
            isRequired={props.required}
            validated={error ? 'error' : undefined}
        >
            <Select
                id={id}
                variant={SelectVariant.single}
                aria-describedby={`${id}-helper`}
                validated={error ? 'error' : undefined}
                {...field}
                isOpen={open}
                onToggle={() => setOpen(!open)}
                selections={selectedIndex === -1 ? '' : selectedIndex.toString()}
                onSelect={onSelect}
                isCreatable={props.create}
                isInputFilterPersisted={props.create}
                placeholderText={props.placeholder}
                isGrouped={isGrouped}
                footer={
                    props.footer?.label && (
                        <Button
                            variant="link"
                            isInline
                            onClick={() => {
                                setOpen(false)
                                props.footer?.click?.()
                            }}
                        >
                            {props.footer.label}
                        </Button>
                    )
                }
                maxHeight={280}
            >
                {!isGrouped
                    ? options.map((option, index) => (
                          <SelectOption key={index} value={index.toString()} label={option.label} description={option.description}>
                              {option.label}
                          </SelectOption>
                      ))
                    : Object.keys(groups).map((group) => (
                          <SelectGroup key={group} label={group}>
                              {groups[group].map((option) => (
                                  <SelectOption
                                      key={index}
                                      value={(index++).toString()}
                                      label={option.label}
                                      description={option.description}
                                  >
                                      {option.label}
                                  </SelectOption>
                              ))}
                          </SelectGroup>
                      ))}
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
                return (
                    <MenuItem key={(child.props as { value: string }).value}>{(child.props as { children: ReactNode }).children}</MenuItem>
                )
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

export function FormTextSelect<T>(props: {
    id?: string
    label: string
    name: string
    helperText?: string
    required?: boolean
    secret?: boolean
    autoFocus?: boolean
    placeholder?: string
    selectTitle?: string
    selectValue?: (item: T) => string | number
    selectOpen?: (callback: (item: T) => void, title: string) => void
}) {
    const {
        register,
        setValue,
        formState: { isSubmitting },
    } = useFormContext()
    const registration = register(props.name)
    const { fieldState } = useController({ name: props.name })
    const error = fieldState.error
    let id = props.id ?? props.name
    id = id.split('.').join('-')
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
                    <Button
                        variant="control"
                        onClick={() =>
                            props.selectOpen?.((item: T) => {
                                if (props.selectValue) {
                                    const value = props.selectValue(item)
                                    setValue(props.name, value, { shouldValidate: true })
                                }
                            }, props.selectTitle as string)
                        }
                        aria-label="Options menu"
                        isDisabled={isSubmitting}
                    >
                        <SearchIcon />
                    </Button>
                </InputGroup>
            </FormGroup>
            {/* <SelectDialog
                open={open}
                setOpen={setOpen}
                onClick={(organization: Organization) => {
                    setValue(props.name, organization.name, { shouldValidate: true })
                }}
            /> */}
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
                switch ((property as { variant?: string }).variant) {
                    case 'select': {
                        if ('options' in property) {
                            const formSelectProps = property as unknown as FormSelectProps<unknown>
                            p.push(
                                <FormSelect
                                    key={base + propertyName}
                                    name={base + propertyName}
                                    label={title}
                                    placeholder={placeholder}
                                    required={required}
                                    options={formSelectProps.options}
                                    footer={formSelectProps.footer}
                                />
                            )
                        } else {
                            p.push(
                                <FormTextSelect
                                    key={base + propertyName}
                                    name={base + propertyName}
                                    label={title}
                                    placeholder={placeholder}
                                    required={required}
                                    selectTitle={(property as { selectTitle?: string }).selectTitle}
                                    selectValue={(property as { selectValue?: (organization: unknown) => string | number }).selectValue}
                                    selectOpen={
                                        (
                                            property as {
                                                selectOpen?: (callback: (organization: Organization) => void, title: string) => void
                                            }
                                        ).selectOpen
                                    }
                                />
                            )
                        }
                        break
                    }
                    case 'textarea':
                        p.push(
                            <FormTextArea
                                key={base + propertyName}
                                name={base + propertyName}
                                label={title}
                                placeholder={placeholder}
                                required={required}
                            />
                        )
                        break
                    case 'secret':
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
                        break
                    default:
                        p.push(
                            <FormTextInput
                                key={base + propertyName}
                                name={base + propertyName}
                                label={title}
                                placeholder={placeholder}
                                required={required}
                            />
                        )
                        break
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
    singleColumn?: boolean
}) {
    const { schema, defaultValue } = props
    const form = useForm<T>({
        defaultValues: defaultValue ?? ({} as DeepPartial<T>),
        resolver: schema ? ajvResolver(schema as Ajv.JSONSchemaType<T>, { strict: false, addFormats: true } as Ajv.Options) : undefined,
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
                onSubmit={handleSubmit((data) => {
                    setError('')
                    return props.onSubmit(data, setError, setFieldError)
                })}
                isHorizontal={isHorizontal}
                // style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden', gap: 0 }}
            >
                {/* <Scrollable style={{ height: '100%', flexGrow: 1 }}> */}
                <PageSection isFilled padding={{ default: props.onCancel ? 'padding' : 'noPadding' }} variant="light" style={{ maxWidth }}>
                    <Grid hasGutter span={12} sm={sm} md={md} lg={lg} xl={xl} xl2={xl2}>
                        {props.schema && <FormSchema schema={props.schema} />}
                        {props.children}
                    </Grid>
                </PageSection>
                {/* </Scrollable> */}
                <Collapse open={!!error}>
                    <Alert
                        variant="danger"
                        title={error ?? ''}
                        isInline
                        style={{ paddingLeft: isMd && props.onCancel ? 190 : undefined }}
                    />
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
        // </PageBody>
    )
}

export type FormPageSubmitHandler<T extends FieldValues> = (
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
