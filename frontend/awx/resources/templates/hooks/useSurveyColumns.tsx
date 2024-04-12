import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, ChipGroup, Icon, Flex, Tooltip } from '@patternfly/react-core';
import { AsteriskIcon } from '@patternfly/react-icons';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import type { Spec } from '../../../interfaces/Survey';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useSurveyColumns(_options?: {
  templateType?: 'job_template' | 'workflow_job_template';
  id?: string;
}) {
  const { t } = useTranslation();
  const { templateType, id } = _options ?? {};

  const getPageUrl = useGetPageUrl();

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
              to={getPageUrl(
                templateType === 'job_template'
                  ? AwxRoute.EditJobTemplateSurvey
                  : AwxRoute.EditWorkflowJobTemplateSurvey,
                { params: { id }, query: { question_variable: question.variable } }
              )}
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
              {question.default
                .toString()
                .split('\n')
                .map((chip) => (
                  <Chip key={chip} isReadOnly ouiaId={`${question.variable}-${chip}`}>
                    {chip}
                  </Chip>
                ))}
            </ChipGroup>
          );
        },
      },
    ],
    [t, getPageUrl, id, templateType]
  );
}
