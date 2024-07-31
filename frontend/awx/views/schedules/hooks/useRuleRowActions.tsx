import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { PageActionSelection, PageActionType } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { RuleListItemType } from '../types';
import { useMemo } from 'react';
import { IPageAction } from '../../../../../framework';
import { useFormContext } from 'react-hook-form';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { RULES_DEFAULT_VALUES } from '../wizard/constants';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';

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
    const existingExceptions = context.getValues('exceptions') as RuleListItemType[];

    const deleteRule = (rule: RuleListItemType) => {
      const filteredRules = rules.filter((item) => item.id !== rule.id);

      isExceptionStep
        ? context.setValue('exceptions', filteredRules)
        : context.setValue('rules', filteredRules);
      wizard.setStepData((prev) => {
        isExceptionStep
          ? (prev.exceptions = { ...RULES_DEFAULT_VALUES, exceptions: filteredRules })
          : (prev.rules = { ...RULES_DEFAULT_VALUES, rule: filteredRules });
        return {
          ...prev,
        };
      });
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
          let untilDateTime!: string[];
          if (rule === undefined || !rule.rule) return;
          if (rule?.rule?.options?.until !== null) {
            untilDateTime = dateToInputDateTime(
              rule?.rule?.options?.until?.toISOString() ?? '',
              rule?.rule?.options?.tzid
            );
          }

          const ruleData = {
            ...rule.rule.options,
            endType: rule.rule.options.count
              ? 'count'
              : rule.rule.options.until
                ? 'until'
                : 'never',
            id: rule.id,
            rules: existingRules || [],
            exceptions: existingExceptions || [],
            until:
              rule?.rule?.options?.until !== null
                ? { date: untilDateTime[0], time: untilDateTime[1] }
                : null,
          };
          context.reset(ruleData);
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
