import { JSONSchema6 } from 'json-schema'
import { ReactNode } from 'react'
import { PageFormSelectOption, PageFormSelectOptionProps } from './Inputs/PageFormSelectOption'
import { PageFormSlider } from './Inputs/PageFormSlider'
import { PageFormSwitch } from './Inputs/PageFormSwitch'
import { PageFormTextArea } from './Inputs/PageFormTextArea'
import { PageFormTextInput } from './Inputs/PageFormTextInput'
import { FormTextSelect } from './Inputs/PageFormTextSelect'

export function PageFormSchema(props: { schema: JSONSchema6; base?: string }) {
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
    const description = typeof property.description === 'string' ? property.description : undefined

    let placeholder: string | undefined = (property as { placeholder?: string }).placeholder
    placeholder = typeof placeholder === 'string' ? placeholder : undefined

    const required = Array.isArray(schema.required) && schema.required.includes(propertyName)

    switch (property.type) {
      case 'string': {
        switch ((property as { variant?: string }).variant) {
          case 'select': {
            if ('options' in property) {
              const formSelectProps = property as unknown as PageFormSelectOptionProps<unknown>
              p.push(
                <PageFormSelectOption
                  id={base + propertyName}
                  key={base + propertyName}
                  name={base + propertyName}
                  label={title}
                  placeholder={placeholder}
                  isRequired={required}
                  options={formSelectProps.options}
                  footer={formSelectProps.footer}
                  labelHelpTitle={title}
                  labelHelp={description}
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
                  selectValue={
                    (
                      property as {
                        selectValue?: (organization: unknown) => string | number
                      }
                    ).selectValue
                  }
                  selectOpen={
                    (
                      property as {
                        selectOpen?: (callback: (item: unknown) => void, title: string) => void
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
              <PageFormTextArea
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
              <PageFormTextInput
                key={base + propertyName}
                name={base + propertyName}
                label={title}
                placeholder={placeholder}
                isRequired={required}
                type="password"
              />
            )
            break
          default:
            p.push(
              <PageFormTextInput
                key={base + propertyName}
                name={base + propertyName}
                label={title}
                placeholder={placeholder}
                isRequired={required}
              />
            )
            break
        }
        break
      }
      case 'number': {
        p.push(
          <PageFormSlider
            key={base + propertyName}
            name={base + propertyName}
            label={title}
            required={required}
            min={(property as { min?: number }).min}
            max={(property as { max?: number }).max}
            valueLabel={(property as { valueLabel?: string }).valueLabel}
          />
        )
        break
      }
      case 'boolean': {
        p.push(
          <PageFormSwitch
            key={base + propertyName}
            name={base + propertyName}
            label={title}
            required={required}
          />
        )
        break
      }
      case 'object': {
        p.push(<PageFormSchema key={propertyName} schema={property} base={base + propertyName} />)
        break
      }
    }
  }

  return <>{p}</>
}
