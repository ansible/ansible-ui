import { useTranslation } from 'react-i18next';
import { useAwxConfig } from '../../useAwxConfig';
import { PageFormSelect } from '../../../../../framework';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { getDocsBaseUrl } from '../../util/getDocsBaseUrl';

export function ConvergenceInput() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  return (
    <PageFormSelect<WizardFormValues>
      isRequired
      label={t('Convergence')}
      name="node_convergence"
      data-cy="node-convergence"
      labelHelpTitle={t('Convergence')}
      labelHelp={
        <>
          {t('Preconditions for running this node when there are multiple parents')}{' '}
          <a
            href={`${getDocsBaseUrl(config)}/html/userguide/workflow_templates.html#converge-node`}
          >
            {t('documentation.')}
          </a>
        </>
      }
      options={[
        {
          label: t('Any'),
          value: 'any',
          description: t(
            'Ensures that at least one parent node met the expected outcome in order to run the child node.'
          ),
        },
        {
          label: t('All'),
          value: 'all',
          description: t(
            'Ensures that every parent node met the expected outcome in order to run the child node.'
          ),
        },
      ]}
    />
  );
}
