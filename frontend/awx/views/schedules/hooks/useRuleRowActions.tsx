import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { PageActionSelection, PageActionType } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { RuleListItemType } from '../types';
import { useMemo } from 'react';
import { IPageAction } from '../../../../../framework';
import { useFormContext } from 'react-hook-form';

export function useRuleRowActions(
  rules: RuleListItemType[],
  setIsOpen: (isOpen: boolean | number) => void
) {
  const { t } = useTranslation();
  const { setValue, reset, getValues } = useFormContext();
  const existingRules = getValues('rules') as RuleListItemType[];
  return useMemo<IPageAction<RuleListItemType>[]>(() => {
    const deleteRule = (rule: RuleListItemType) => {
      const filteredRules = rules.filter((item) => item.id !== rule.id);
      setValue('rules', filteredRules);
    };

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit rule'),
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
        label: t('Delete rule'),
        onClick: (rule) => deleteRule(rule),
        isDanger: true,
      },
    ];
  }, [t, setValue, rules, existingRules, reset, setIsOpen]);
}
