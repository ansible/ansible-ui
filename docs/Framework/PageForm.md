The [PageForm](./PageForm) is used to create forms for input by the user.

PageForm and the input components wrap [PatternFly](https://www.patternfly.org) components using [react-hook-form](https://react-hook-form.com).


```tsx
<PageLayout>
  <PageHeader />
  <PageForm<DataType>
    onSubmit={(data: DataType, setError) => { /* Handle submit */ }}
    defaultValue={objectBeingEdited}
  >
    <PageFormInput... />
    <PageFormInput... />
    <PageFormInput... />
  </PageForm>
</PageLayout>
```

## Inputs

Inputs are bound the data context of the form by the `name` property of the input.

SEE: [react-hook-form](https://react-hook-form.com)

- `name` is required and unique.
- `name` can neither start with a number nor use number as key name.
- `name` supports both dot and bracket syntax, which allows you to easily create nested form fields.
- `name` is using dot syntax only for typescript usage consistency, so bracket [] will not work for array form value.
  - 'test.0.firstName' ✅
  - 'test[0]firstName' ❌

See [handling errors](https://github.com/ansible/ansible-ui/blob/main/framework/PageForm/README.md) inside PageForm.

### PageFormTextInput

```tsx
<PageFormTextInput
  name="name"
  label="Name"              
  placeholder="Enter name"
  isRequired
  minLength={10}
  maxLength={100}
  pattern={{ value: /^abc/, message: "Name must start with 'abc'" }}
  validate={(value:string) => "some error string"}
/>
```

For async selection of options also allowing for text entry:

```tsx
<PageFormTextInput<Organization>
  name="organization"
  label="Organization"              
  selectTitle="Select organization"
  selectValue={(organization) => organization.name}
  selectOpen={openSelectOrganizationDialog}
/>
```

### PageFormTextArea

```tsx
<PageFormTextArea
  name="description"
  label="Description"              
  placeholder="Enter description"
  isRequired
  minLength={10}
  maxLength={100}
  pattern={{ value: /^abc/, message: "Description must start with 'abc'" }}
  validate={(value:string) => "some error string"}
/>
```

### PageFormSelectOption

```tsx
<PageFormSelectOption
  name="userType"
  label='User type'
  placeholderText='Select user type'
  options={[
    {
      label: 'Administrator',
      description: 'Unrestricted access to all resources.',
      value: 'administrator',
    },
    {
      label: 'Normal user',
      description: 'Only has access to resource based on permissions.',
      value: 'user',
    }
  ]}
  isRequired
/>
```

## Utils

### PageFormSection

A form section with a title that contains inputs.

```tsx
<PageSection title="My section">
  <PageFormInput... />
</PageSection>
```

### PageFormHidden

A component that hides it's contents based on a [watch](https://react-hook-form.com/api/usewatch) and function to evaluate the watch.

```tsx
<PageFormHidden watch="somevalue" hidden={(somevalue)=>true} >
  <PageFormInput... />
  <PageFormInput... />
</PageFormHidden>
```

### PageFormWatch

A component that [watches](https://react-hook-form.com/api/usewatch) a value and makes it available.

```tsx
<PageFormWatch watch="somevalue" >
  {(somevalue) => {
    return <>
      <PageFormInput... />
      <PageFormInput... />
    </>
  }}
</PageFormWatch>
```

## Validation

| Prop | Type | Description
| ---: | --- | ---
| isRequired | `boolean` | Boolean which, if true, indicates that the input must have a value before the form can be submitted. You can assign a string to return an error message in the errors object.
| maxLength | `number` | The maximum length of the value to accept for this input.
| minLength | `number` | The minimum length of the value to accept for this input.
| max | `number` | The minimum value to accept for this input.
| min | `number` | The minimum value to accept for this input.
| pattern | `RegExp` | The regex pattern for the input.
| validate | `Function` \| `Object` | You can pass a callback function as the argument to validate, or you can pass an object of callback functions to validate all of them. This function will be executed on its own without depending on other validation rules included in the required attribute.

### Asynchronous validation

The validate function can return a promise for asynchronous validation.

```tsx
<PageFormTextInput
  validate={async (value: string) => {
    try{
      const response = await fetch(...)
      if(response.status === 404) return "Not found"
    } catch(err) {
       return error?.message ?? "Unknown error"
    }
  }}
  ...
/>
```

### Default error messages

Example: PageFormTextInput with a label of "Organization name"
    
| Prop | Error message
| --- | ---
| isRequired | Organization name is required.
| maxLength | Organization name cannot be greater than 100 characters.
| minLength | Organization name must be at least 10 characters.

### Custom error messages

Custom error messages can be provided by providing an object with a `value` and `message`.

```tsx
<PageFormTextInput
  isRequired={{ value: true, message: "Some message" }}
  minLength={{ value: 10, message: "Some message" }}
  maxLength={{ value: 100, message: "Some message" }}
  ...
/>
```

> Validation reference: https://react-hook-form.com/api/useform/register