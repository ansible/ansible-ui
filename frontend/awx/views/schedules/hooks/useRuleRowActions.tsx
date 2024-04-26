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
  setIsOpen?: (isOpen: boolean | number) => void
) {
  const { t } = useTranslation();
  const context = useFormContext();
  const wizard = usePageWizard();
  return useMemo<IPageAction<RuleListItemType>[]>(() => {
    if (!setIsOpen) return [];
    const isExceptionStep = wizard.activeStep && wizard.activeStep.id === 'exceptions';
    const existingRules = context.getValues('rules') as RuleListItemType[];
    const deleteRule = (rule: RuleListItemType) => {
      const filteredRules = rules.filter((item) => item.id !== rule.id);
      isExceptionStep
        ? context.setValue('exceptions', filteredRules)
        : context.setValue('rules', filteredRules);
      wizard.setStepData((prev) => ({
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

          context.reset({ ...rule.rule.options, id: rule.id, rules: existingRules || [] });
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
  }, [t, rules, context, wizard, setIsOpen]);
}
