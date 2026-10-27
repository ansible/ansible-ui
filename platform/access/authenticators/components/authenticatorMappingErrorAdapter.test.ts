import { describe, expect, test } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import {
  authenticatorMappingErrorAdapter,
  AuthenticatorMappingFormState,
} from './authenticatorMappingErrorAdapter';

const CLEAN_TEXT_ERROR =
  "This field can't include HTML tags, script markup, or unsafe URI schemes.";

function requestError(json: object) {
  return new RequestError('Bad Request', undefined, 400, json, json);
}

describe('authenticatorMappingErrorAdapter', () => {
  const singleAttributeForm: AuthenticatorMappingFormState = {
    attributes: [{ attribute: 'test', comparison: 'contains', value: '<script>{{malicious}}' }],
  };

  const maliciousAttributeForm: AuthenticatorMappingFormState = {
    attributes: [
      { attribute: '{{malicioius}}', comparison: 'contains', value: '<script>{{malicious}}' },
    ],
  };

  test('maps a value error onto attributes.0.value', () => {
    const error = requestError({
      triggers: {
        'attributes.test.contains': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error, singleAttributeForm)).toEqual({
      genericErrors: [],
      fieldErrors: [{ name: 'attributes.0.value', message: CLEAN_TEXT_ERROR }],
    });
  });

  test('maps an invalid attribute-name error onto attributes.0.attribute', () => {
    const error = requestError({
      triggers: {
        'attributes.{{malicioius}}': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error, maliciousAttributeForm)).toEqual({
      genericErrors: [],
      fieldErrors: [{ name: 'attributes.0.attribute', message: CLEAN_TEXT_ERROR }],
    });
  });

  test('maps attribute-name and value errors onto both fields', () => {
    const error = requestError({
      triggers: {
        'attributes.{{malicioius}}': [CLEAN_TEXT_ERROR],
        'attributes.{{malicioius}}.contains': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error, maliciousAttributeForm)).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'attributes.0.attribute', message: CLEAN_TEXT_ERROR },
        { name: 'attributes.0.value', message: CLEAN_TEXT_ERROR },
      ],
    });
  });

  test('maps a value error onto the matching row when multiple attributes exist', () => {
    const error = requestError({
      triggers: {
        'attributes.attribute two.matches': [CLEAN_TEXT_ERROR],
      },
    });

    const result = authenticatorMappingErrorAdapter(error, {
      attributes: [
        { attribute: 'attribute one', comparison: 'contains', value: 'value one' },
        { attribute: 'attribute two', comparison: 'matches', value: '<script>bad</script>' },
      ],
    });

    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [{ name: 'attributes.1.value', message: CLEAN_TEXT_ERROR }],
    });
  });

  test('maps in-comparison list-item errors onto the value field', () => {
    const error = requestError({
      triggers: {
        'attributes.test.in[0]': [CLEAN_TEXT_ERROR],
      },
    });

    const result = authenticatorMappingErrorAdapter(error, {
      attributes: [{ attribute: 'test', comparison: 'in', value: '<script>a</script>,ok' }],
    });

    expect(result.fieldErrors).toEqual([{ name: 'attributes.0.value', message: CLEAN_TEXT_ERROR }]);
  });

  test('maps join_condition errors onto conditional', () => {
    const error = requestError({
      triggers: {
        'attributes.join_condition': ['Invalid, choices can only be one of: or, and'],
      },
    });

    expect(authenticatorMappingErrorAdapter(error, singleAttributeForm).fieldErrors).toEqual([
      { name: 'conditional', message: 'Invalid, choices can only be one of: or, and' },
    ]);
  });

  test('maps group trigger errors onto groups_value', () => {
    const error = requestError({
      triggers: {
        'groups.has_or[0]': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error).fieldErrors).toEqual([
      { name: 'groups_value', message: CLEAN_TEXT_ERROR },
    ]);
  });

  test('maps top-level dotted trigger keys from trigger-definition validation', () => {
    const error = requestError({
      'triggers.attributes.test.contains': [CLEAN_TEXT_ERROR],
    });

    expect(authenticatorMappingErrorAdapter(error, singleAttributeForm).fieldErrors).toEqual([
      { name: 'attributes.0.value', message: CLEAN_TEXT_ERROR },
    ]);
  });

  test('keeps sibling field errors such as name', () => {
    const error = requestError({
      name: ['This field is required.'],
      triggers: {
        'attributes.test.contains': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error, singleAttributeForm)).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'attributes.0.value', message: CLEAN_TEXT_ERROR },
        { name: 'name', message: 'This field is required.' },
      ],
    });
  });

  test('surfaces unmapped trigger errors as generic errors when multiple rows cannot be matched', () => {
    const error = requestError({
      triggers: {
        'attributes.unknown.contains': [CLEAN_TEXT_ERROR],
      },
    });

    expect(
      authenticatorMappingErrorAdapter(error, {
        attributes: [
          { attribute: 'test', comparison: 'contains', value: 'one' },
          { attribute: 'other', comparison: 'equals', value: 'two' },
        ],
      })
    ).toEqual({
      genericErrors: [{ message: CLEAN_TEXT_ERROR }],
      fieldErrors: [],
    });
  });

  test('falls back to the single row when the submitted name cannot be matched', () => {
    const error = requestError({
      triggers: {
        'attributes.{{malicioius}}.contains': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error, singleAttributeForm).fieldErrors).toEqual([
      { name: 'attributes.0.value', message: CLEAN_TEXT_ERROR },
    ]);
  });

  test('treats an attribute name that ends with a comparison operator as an attribute error', () => {
    const error = requestError({
      triggers: {
        'attributes.foo.contains': [CLEAN_TEXT_ERROR],
      },
    });

    expect(
      authenticatorMappingErrorAdapter(error, {
        attributes: [{ attribute: 'foo.contains', comparison: 'equals', value: 'ok' }],
      }).fieldErrors
    ).toEqual([{ name: 'attributes.0.attribute', message: CLEAN_TEXT_ERROR }]);
  });

  test('falls back to the single row for an unmatched attribute-name error', () => {
    const error = requestError({
      triggers: {
        'attributes.{{malicioius}}': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error, singleAttributeForm).fieldErrors).toEqual([
      { name: 'attributes.0.attribute', message: CLEAN_TEXT_ERROR },
    ]);
  });

  test('treats unknown trigger types as generic errors', () => {
    const error = requestError({
      'triggers.always': ['Invalid'],
    });

    expect(authenticatorMappingErrorAdapter(error)).toEqual({
      genericErrors: [{ message: 'Invalid' }],
      fieldErrors: [],
    });
  });

  test('treats a string triggers error as a generic error', () => {
    const error = requestError({
      triggers: 'Triggers must be a valid dict',
    });

    expect(authenticatorMappingErrorAdapter(error)).toEqual({
      genericErrors: [{ message: 'Triggers must be a valid dict' }],
      fieldErrors: [],
    });
  });

  test('handles a regular Error', () => {
    expect(authenticatorMappingErrorAdapter(new Error('Something went wrong'))).toEqual({
      genericErrors: [{ message: 'Something went wrong' }],
      fieldErrors: [],
    });
  });

  test('concatenates distinct trigger errors that map onto the same field', () => {
    const error = requestError({
      triggers: {
        'groups.has_or[0]': ['Group A is invalid'],
        'groups.has_and[0]': ['Group B is invalid'],
      },
    });

    expect(authenticatorMappingErrorAdapter(error).fieldErrors).toEqual([
      { name: 'groups_value', message: 'Group A is invalid; Group B is invalid' },
    ]);
  });

  test('does not duplicate the same trigger error mapped onto one field', () => {
    const error = requestError({
      triggers: {
        'groups.has_or[0]': [CLEAN_TEXT_ERROR],
        'groups.has_and[0]': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error).fieldErrors).toEqual([
      { name: 'groups_value', message: CLEAN_TEXT_ERROR },
    ]);
  });

  test('maps empty trigger field errors skipped by the nested collector onto the same field', () => {
    const error = requestError({
      'triggers.groups.has_or[0]': [''],
      'triggers.groups.has_and[0]': [''],
    });

    expect(authenticatorMappingErrorAdapter(error).fieldErrors).toEqual([
      { name: 'groups_value', message: '' },
    ]);
  });

  test('treats attribute trigger errors as generic when the form has no attribute rows', () => {
    const error = requestError({
      triggers: {
        'attributes.test.contains': [CLEAN_TEXT_ERROR],
      },
    });

    expect(authenticatorMappingErrorAdapter(error)).toEqual({
      genericErrors: [{ message: CLEAN_TEXT_ERROR }],
      fieldErrors: [],
    });
    expect(authenticatorMappingErrorAdapter(error, { attributes: [] })).toEqual({
      genericErrors: [{ message: CLEAN_TEXT_ERROR }],
      fieldErrors: [],
    });
  });

  test('surfaces an unmatched attribute-name error as generic when multiple rows exist', () => {
    const error = requestError({
      triggers: {
        'attributes.unknown': [CLEAN_TEXT_ERROR],
      },
    });

    expect(
      authenticatorMappingErrorAdapter(error, {
        attributes: [
          { attribute: 'test', comparison: 'contains', value: 'one' },
          { attribute: 'other', comparison: 'equals', value: 'two' },
        ],
      })
    ).toEqual({
      genericErrors: [{ message: CLEAN_TEXT_ERROR }],
      fieldErrors: [],
    });
  });

  test('maps a dotted attribute name that is not a comparison operator', () => {
    const error = requestError({
      triggers: {
        'attributes.foo.bar': [CLEAN_TEXT_ERROR],
      },
    });

    expect(
      authenticatorMappingErrorAdapter(error, {
        attributes: [{ attribute: 'foo.bar', comparison: 'equals', value: 'ok' }],
      }).fieldErrors
    ).toEqual([{ name: 'attributes.0.attribute', message: CLEAN_TEXT_ERROR }]);
  });

  test('stringifies non-string trigger error values', () => {
    const error = requestError({
      triggers: {
        'groups.has_or[0]': [401],
      },
    });

    expect(authenticatorMappingErrorAdapter(error).fieldErrors).toEqual([
      { name: 'groups_value', message: '401' },
    ]);
  });
});
