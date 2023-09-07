/**
 * useStepValidation Hook
 *
 * Allows you to create a custom resolver function
 * for react-hook-form, based on a provided wizard schema.
 * It enables conditional validation based on visited steps of a multi-step wizard form.
 *
 * @template T - The type representing your form data.
 *
 * @param {Object} props - The configuration object for the hook.
 * @param {Schema|undefined} props.validationSchema - The schema defining the structure and validation rules for your form data.
 * @param {Array<{ id: string }>} props.steps - An array of step objects, each with an 'id' property representing a form step.
 * @param {string[]} props.visitedSteps - An array of strings representing the steps that have been visited in the form.
 *
 * @returns {Resolver<T>|undefined} - A resolver function for react-hook-form or undefined if no validation schema is provided.
 */

import { JSONSchemaType } from 'ajv';
import { ajvResolver } from '@hookform/resolvers/ajv';
import { ResolverOptions, Resolver, ResolverResult, FieldValues } from 'react-hook-form';
import type { Schema, Step } from './types';

function deepCopy(object: Schema) {
  return JSON.parse(JSON.stringify(object)) as Schema;
}

function hasValidateAll(visitedSteps: string[], allSteps: Step[]) {
  for (const stepId of visitedSteps) {
    const step = allSteps.find((step) => step.id === stepId);
    if (step && step.validateAllSteps) {
      return true;
    }
  }
  return false;
}

export function useStepValidation<T extends FieldValues>({
  validationSchema,
  steps,
  visitedSteps,
}: {
  validationSchema?: Schema | undefined;
  steps: Step[];
  visitedSteps: string[];
}): Resolver<T> | undefined {
  if (!validationSchema) {
    return undefined;
  }
  return async (
    data: T,
    context: object,
    options: ResolverOptions<T>
  ): Promise<ResolverResult<T>> => {
    // If the review step has been visited, validate the entire form.
    if (hasValidateAll(visitedSteps, steps)) {
      return ajvResolver(validationSchema as JSONSchemaType<T>)(data, context, options);
    } else {
      // Otherwise, only validate the visited steps.
      const prunedSchema = deepCopy(validationSchema);
      for (const step of steps) {
        if (!visitedSteps.includes(step.id)) {
          delete prunedSchema.properties?.[step.id];
        }
      }
      return ajvResolver(prunedSchema as JSONSchemaType<T>)(data, context, options);
    }
  };
}
