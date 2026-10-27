import {
  ErrorOutput,
  FieldErrorDetail,
  GenericErrorDetail,
} from '@ansible/ansible-ui-framework/PageForm/typesErrorAdapter';
import { isRequestError } from '@ansible/common-ui/crud/RequestError';
import { awxErrorAdapter } from '@ansible/awx-ui/common/adapters/awxErrorAdapter';

const COMPARISON_OPERATORS = new Set(['contains', 'matches', 'ends_with', 'equals', 'in']);

export interface AuthenticatorMappingFormState {
  attributes?: Array<{
    attribute: string;
    comparison: string;
    value: string;
  }>;
}

/**
 * Maps gateway authenticator-map 400 payloads onto the mapping form fields.
 *
 * CleanTextMixin reports JSON-field errors as a nested object of dotted paths:
 * `{ triggers: { "attributes.test.contains": ["..."], "attributes.{{bad}}": ["..."] } }`.
 * Trigger-definition errors use the same paths as top-level keys
 * (`triggers.attributes.test.contains`). The form stores rows as
 * `attributes.{index}.attribute` / `attributes.{index}.value`, so the default
 * AWX adapter drops the nested object and never sets a field error.
 */
export function authenticatorMappingErrorAdapter(
  error: unknown,
  formValues?: AuthenticatorMappingFormState
): ErrorOutput {
  const { genericErrors, fieldErrors } = awxErrorAdapter(error);
  const mappedFieldErrors: FieldErrorDetail[] = [];
  const mappedGenericErrors: GenericErrorDetail[] = [...genericErrors];
  const seenTriggerPaths = new Set<string>();

  const addTriggerError = (path: string, message: string) => {
    const formFieldName = mapTriggerErrorToFormField(path, formValues);
    if (formFieldName) {
      appendFieldError(mappedFieldErrors, formFieldName, message);
    } else {
      mappedGenericErrors.push({ message });
    }
  };

  if (isRequestError(error) && error.json && typeof error.json === 'object') {
    for (const entry of collectTriggerErrorEntries(error.json as Record<string, unknown>)) {
      seenTriggerPaths.add(entry.name);
      addTriggerError(entry.name, entry.message);
    }
  }

  for (const fieldError of fieldErrors) {
    if (isTriggerErrorPath(fieldError.name)) {
      if (!seenTriggerPaths.has(fieldError.name) && typeof fieldError.message === 'string') {
        addTriggerError(fieldError.name, fieldError.message);
      }
      continue;
    }
    mappedFieldErrors.push(fieldError);
  }

  return { genericErrors: mappedGenericErrors, fieldErrors: mappedFieldErrors };
}

function isTriggerErrorPath(name: string): boolean {
  return name === 'triggers' || name.startsWith('triggers.');
}

function messageFromValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value) {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    const first: unknown = value[0];
    return typeof first === 'string' ? first : String(first);
  }
  return undefined;
}

function flattenTriggerErrors(
  value: unknown,
  prefix: string,
  out: { name: string; message: string }[]
): void {
  const message = messageFromValue(value);
  if (message) {
    out.push({ name: prefix, message });
    return;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      flattenTriggerErrors(child, prefix ? `${prefix}.${key}` : key, out);
    }
  }
}

function collectTriggerErrorEntries(
  json: Record<string, unknown>
): { name: string; message: string }[] {
  const out: { name: string; message: string }[] = [];
  if ('triggers' in json) {
    flattenTriggerErrors(json.triggers, 'triggers', out);
  }
  for (const [key, value] of Object.entries(json)) {
    if (key !== 'triggers' && key.startsWith('triggers.')) {
      flattenTriggerErrors(value, key, out);
    }
  }
  return out;
}

function appendFieldError(fieldErrors: FieldErrorDetail[], name: string, message: string): void {
  const existing = fieldErrors.find((fieldError) => fieldError.name === name);
  if (!existing) {
    fieldErrors.push({ name, message });
    return;
  }
  const existingMessage = typeof existing.message === 'string' ? existing.message : '';
  if (!existingMessage) {
    existing.message = message;
    return;
  }
  if (!existingMessage.includes(message)) {
    existing.message = `${existingMessage}; ${message}`;
  }
}

function findAttributeIndex(
  formValues: AuthenticatorMappingFormState | undefined,
  attributeName: string,
  comparison?: string
): number {
  const attributes = formValues?.attributes;
  if (!attributes?.length) {
    return -1;
  }
  if (comparison) {
    const exact = attributes.findIndex(
      (row) => row.attribute === attributeName && row.comparison === comparison
    );
    if (exact >= 0) {
      return exact;
    }
  }
  return attributes.findIndex((row) => row.attribute === attributeName);
}

function stripTriggersPrefix(path: string): string {
  if (path === 'triggers') {
    return '';
  }
  if (path.startsWith('triggers.')) {
    return path.slice('triggers.'.length);
  }
  return path;
}

function mapTriggerAttributePath(
  rest: string,
  formValues?: AuthenticatorMappingFormState
): string | undefined {
  if (rest === 'join_condition') {
    return 'conditional';
  }

  const withoutListIndex = rest.replace(/\[\d+\]$/, '');
  const lastDot = withoutListIndex.lastIndexOf('.');
  if (lastDot >= 0) {
    const maybeComparison = withoutListIndex.slice(lastDot + 1);
    const attrName = withoutListIndex.slice(0, lastDot);
    if (COMPARISON_OPERATORS.has(maybeComparison)) {
      const valueIndex = findAttributeIndex(formValues, attrName, maybeComparison);
      if (valueIndex >= 0) {
        return `attributes.${valueIndex}.value`;
      }
      const nameIndex = findAttributeIndex(formValues, withoutListIndex);
      if (nameIndex >= 0) {
        return `attributes.${nameIndex}.attribute`;
      }
      if (formValues?.attributes?.length === 1) {
        return 'attributes.0.value';
      }
      return undefined;
    }
  }

  const attrIndex = findAttributeIndex(formValues, withoutListIndex);
  if (attrIndex >= 0) {
    return `attributes.${attrIndex}.attribute`;
  }
  if (formValues?.attributes?.length === 1) {
    return 'attributes.0.attribute';
  }
  return undefined;
}

function mapTriggerErrorToFormField(
  path: string,
  formValues?: AuthenticatorMappingFormState
): string | undefined {
  const normalized = stripTriggersPrefix(path);
  if (!normalized) {
    return undefined;
  }
  if (normalized.startsWith('attributes.')) {
    return mapTriggerAttributePath(normalized.slice('attributes.'.length), formValues);
  }
  if (normalized.startsWith('groups.')) {
    return 'groups_value';
  }
  return undefined;
}
