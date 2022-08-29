import { ajvResolver } from '@hookform/resolvers/ajv'
import {
    ActionGroup,
    Alert,
    Button,
    Checkbox,
    Form,
    FormGroup,
    FormSection,
    Menu,
    MenuItem,
    PageSection,
    Select,
    SelectOption,
    SelectVariant,
    TextInput,
    TextInputGroup,
    TextInputGroupMain,
    TextInputGroupUtilities,
} from '@patternfly/react-core'
import { CaretDownIcon } from '@patternfly/react-icons'
import { Children, Fragment, isValidElement, ReactNode, useState } from 'react'
import { FormProvider, SubmitHandler, useController, useForm, useFormContext, useFormState } from 'react-hook-form'
import { PartialDeep } from 'type-fest'
import { PageHeader, PageHeaderProps, useWindowSizeOrLarger, WindowSize } from '../../framework'
import { Scrollable } from '../../framework/components/Scrollable'

export type FormPageProps = PageHeaderProps & {
    children?: ReactNode
    defaultValues?: PartialDeep<T>
    onSubmit: SubmitHandler<PartialDeep<T>>
    schema?: unknown
    isVertical?: boolean
    onCancel?: () => void
    submitText?: string
    hideHeader?: boolean
    noPadding?: boolean
}
export function FormPage<T>(props: FormPageProps) {
    const methods = useForm<PartialDeep<T>>({ defaultValues: props.defaultValues, resolver: ajvResolver(props.schema) })

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
            <FormProvider {...methods}>
                <Form
                    onSubmit={methods.handleSubmit(props.onSubmit)}
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
            </FormProvider>
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
                    {process.env.NODE_ENV === 'development' && errors[Object.keys(errors)[0]].message}
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
                    <Button type="submit" isDisabled={errors && Object.keys(errors).length > 0}>
                        {props.submitText}
                    </Button>
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
    label: string
    name: string
    helperText?: string
    required?: boolean
    secret?: boolean
    autoFocus?: boolean
}) {
    const { control } = useFormContext()
    const {
        field,
        fieldState: { error },
    } = useController({ control, name: props.name })

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
            <TextInput
                id={id}
                type={props.secret ? 'password' : 'text'}
                aria-describedby={`${id}-helper`}
                isRequired={props.required}
                validated={errorMessage ? 'error' : undefined}
                {...field}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={props.autoFocus}
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
                {props.children}
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
