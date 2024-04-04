import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, ChipGroup, Icon, Flex, Tooltip } from '@patternfly/react-core';
import { AsteriskIcon } from '@patternfly/react-icons';
import { ITableColumn, TextCell } from '../../../../../framework';
import type { Spec } from '../../../interfaces/Survey';

export function useSurveyColumns() {
  const { t } = useTranslation();

  return useMemo<ITableColumn<Spec>[]>(
    () => [
      {
        header: t('Name'),
        cell: (question) => (
          <Flex flexWrap={{ default: 'nowrap' }}>
            <TextCell
              text={question?.question_name}
              iconAlign="right"
              icon={
                question.required ? (
                  <Tooltip content={t('Required')}>
                    <Icon status="danger" iconSize="sm" data-cy="survey-question-required">
                      <AsteriskIcon />
                    </Icon>
                  </Tooltip>
                ) : null
              }
            />
          </Flex>
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Type'),
        cell: (question) => <TextCell text={question?.type} />,
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Default'),
        card: 'subtitle',
        list: 'subtitle',
        cell: (question) => {
          if (
            question.default === null ||
            question.default === undefined ||
            question.default === ''
          ) {
            return null;
          }
          if (question.type !== 'multiselect') {
            return question.default;
          }
          return (
            <ChipGroup>
              {question.default.split('\n').map((chip) => (
                <Chip key={chip} isReadOnly ouiaId={`${question.variable}-${chip}`}>
                  {chip}
                </Chip>
              ))}
            </ChipGroup>
          );
        },
      },
    ],
    [t]
  );
}
