import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { PageActionSelection, PageActionType } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { RuleListItemType } from '../types';
import { useMemo } from 'react';
import { IPageAction } from '../../../../../framework';
import { useFormContext } from 'react-hook-form';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';

export function useRuleRowActions(
  rules: RuleListItemType[],
  setIsOpen: (isOpen: boolean | number) => void
) {
  const { t } = useTranslation();
  const { setValue, reset, getValues } = useFormContext();
  const { setStepData, activeStep } = usePageWizard();
  const isExceptionStep = activeStep && activeStep.id === 'exceptions';
  const existingRules = getValues('rules') as RuleListItemType[];
  return useMemo<IPageAction<RuleListItemType>[]>(() => {
    const deleteRule = (rule: RuleListItemType) => {
      const filteredRules = rules.filter((item) => item.id !== rule.id);
      isExceptionStep ? setValue('exceptions', filteredRules) : setValue('rules', filteredRules);
      setStepData((prev) => ({
        ...prev,
        rules: filteredRules,
      }));
    };

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: isExceptionStep ? t('Edit exception') : t('Edit rule'),
        onClick: (r) => {
          setIsOpen(r.id);
          const rule = rules.find((item) => item.id === r.id);
          if (rule === undefined || !rule.rule) return;

          reset({ ...rule.rule.options, id: rule.id, rules: existingRules || [] });
        },
      },

      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: isExceptionStep ? t('Delete exception') : t('Delete rule'),
        isPinned: true,
        onClick: (rule) => {
          deleteRule(rule);
        },
        isDanger: true,
      },
    ];
  }, [t, rules, isExceptionStep, setValue, setStepData, setIsOpen, reset, existingRules]);
}
