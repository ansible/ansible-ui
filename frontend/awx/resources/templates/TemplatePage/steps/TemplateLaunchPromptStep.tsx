import { useEffect } from 'react';
import type { TemplateLaunch } from '../TemplateLaunchWizard';
import { NodePromptsStep } from '../../WorkflowVisualizer/wizard/NodePromptsStep';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';

export function TemplateLaunchPromptStep(props: { defaultValues: TemplateLaunch }) {
  const { setWizardData } = usePageWizard();

  useEffect(() => {
    setWizardData((prev: TemplateLaunch) => {
      const hasPreviousPromptValues = prev?.prompt && Object.entries(prev?.prompt)?.length;

      return {
        ...props.defaultValues,
        prompt: hasPreviousPromptValues ? prev.prompt : props.defaultValues.prompt,
      };
    });
  }, [setWizardData, props.defaultValues]);

  return <NodePromptsStep />;
}
