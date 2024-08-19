import { ErrorOutput } from '../../../../framework/PageForm/typesErrorAdapter';
import { hubErrorAdapter } from '../../common/adapters/hubErrorAdapter';

export const HubNamespaceErrorAdapter = (
  error: unknown,
  mappedKeys?: Record<string, string>
): ErrorOutput => {
  const { genericErrors, fieldErrors } = hubErrorAdapter(error, mappedKeys);

  const filteredFieldErrors = fieldErrors.filter(
    ({ name }) => name !== 'links__url' && name !== 'links__name'
  );

  // Filter `links__url` and `links__name` errors
  const linksErrors = fieldErrors.filter(
    ({ name }) => name === 'links__url' || name === 'links__name'
  );

  // Convert `links__url` and `links__name` errors to generic errors
  linksErrors.forEach(({ message }) => {
    genericErrors.push({ message });
  });

  return { genericErrors, fieldErrors: filteredFieldErrors };
};
