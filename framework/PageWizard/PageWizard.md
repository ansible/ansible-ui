# PageWizard

The `PageWizard` component is a custom React component that provides a wizard-like interface for guiding users through a series of steps. It is designed to work with react-hook-form and supports step validation, input validation, and customizable content.

## Usage

The following code demonstrates a basic usage example:

```tsx
import { PageWizard } from './PageWizard';

// Define your steps, initial values, and validation schema
const steps = [
  {
    id: 'step1'
    name: 'Name'
    children: <NameStep />
  },
  {
    id: 'step2'
    name: 'Email'
    children: <EmailStep />
  },
  {
    id: 'step3'
    name: 'Address'
    children: <AddressStep />
  }
];

const initialValues = {
  step1: {
    name: '',
  },
  step2: {
    email: '',
  },
  step3: {
    address: '',
  },
};

const validationSchema = {
  // Define your validation schema here
};

const MyComponent = () => {
  // Define your onSubmit and onClose functions here

  return (
    <PageWizard
      steps={steps}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onClose={/* your onClose function */}
      onSubmit={/* your onSubmit function */}
    />
  );
};

export default MyComponent;
```

## Props

### PageWizardProps

The PageWizard component accepts the following props:

- **steps** (required): An array of step objects that define the wizard's content and behavior. Each step object should have the following properties:

  - **name** (required): A string representing the step's name.
  - **id** (required): A string representing a unique identifier for the step.
  - **children**: React components or content to be displayed within the step.
  - **isHidden** (optional): A boolean indicating whether the step should be hidden.
  - **nextButtonText** (optional): Custom text for the "Next" button.
  - **validateAllSteps** (optional): A boolean indicating whether to validate all steps.
  - **isNextDisabled** (optional): A function that can be used to determine whether the "Next" button should be disabled based on form state.

- **initialValues** (optional): An object containing initial form values.
- **validationSchema** (optional): A validation schema for form validation. It is passed to react-hook-form's [resolver](https://react-hook-form.com/docs/useform#resolver) function. The PageWizard is currently using the [Ajv validation library](https://github.com/react-hook-form/resolvers#ajv), but we could extend the PageWizard component to accept a custom resolver in the future.
- **onClose** (required): A callback function to be executed when the user closes the wizard.
- **onSubmit** (required): A callback function to be executed when the user submits the wizard form.

## Customization

You can customize the appearance and behavior of the wizard steps by extending or modifying the _steps_ property values. The properties within each step are passed down to PatternFly's WizardStep component.

## Validation

### Steps

1. Create a validation schema in JSON Schema format:

   JSON Schema is like a blueprint for your form data. Here is an example schema:

   ```tsx
   {
        type: 'object',
        properties: {
            step1: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        errorMessage: 'Your custom error message here',
                    },
                },
                required: ['name'],
            },
            step2: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                    },
                },
            },
            step3: {
                type: 'object',
                properties: {
                    address: {
                        type: 'string',
                    },
                },
            },
        },
   };


   ```

2. Understanding the Schema

   - `"type": "object"`: This indicates that the root of the JSON data should be an object. In other words, the JSON data being validated should be a JavaScript object.
   - `"properties"`: This is an object that defines the properties that the JSON object can have. In your schema, there are three properties: step1, step2, and step3.
   - `"step1", "step2", and "step3"`: In the context of step validation, the property names `step1`, `step2`, and `step3` play a crucial role as identifiers for individual form steps. These property names are used to organize and define the structure of your form schema, making it easier to perform step-specific validation and data handling. By convention, you can choose any meaningful names for your steps
   - `"type": "object" inside "step1", "step2", and "step3"`: Each of these indicates that the corresponding property (step1, step2, and step3) should be an object itself. In other words, these properties should have sub-objects.
   - `"properties" inside "step1", "step2", and "step3"`: These define the properties that the sub-objects should have. In your schema, step1 has a property `name`, step2 has a property `email`, and step3 has a property `address`.
   - `"type": "string" inside "name", "email", and "address"`: This specifies that the values of the properties name, email, and address should be strings.
   - `"required": ["name"] inside "step1"`: This indicates that the name property is required within step1. This means that when validating JSON data, the name property must be present within the step1 object.

   In summary, in the example above, this JSON schema describes a wizard with three steps (step1, step2, and step3), where step1 has a required name field, step2 has an optional email field, and step3 has an optional address field.
