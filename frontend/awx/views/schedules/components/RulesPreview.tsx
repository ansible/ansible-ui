import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Label,
  LabelGroup,
  Title,
} from '@patternfly/react-core';
import { useMemo, useState } from 'react';
import { PageWizardStep } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { PreviewSchedule, RuleListItemType, ScheduleFormWizard } from '../types';
import { RRule } from 'rrule';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

export function RulesPreview() {
  const { t } = useTranslation();
  const postRequest = usePostRequest<PreviewSchedule>();
  const [theArray, setTheArray] = useState<PreviewSchedule[]>([]);
  const [theRulesArray, setTheRulesArray] = useState<RuleListItemType[]>([]);
  const { wizardData } = usePageWizard() as {
    wizardData: WizardFormValues & ScheduleFormWizard;
    visibleSteps: PageWizardStep[];
  };

  useMemo(() => {
    if (wizardData.rules.length > 0) {
      wizardData.rules.slice(0, 10).map((element: RuleListItemType) => {
        setTheRulesArray((x) => [...x, element]);
        postRequest(awxAPI`/schedules/preview/`, {
          rrule: RRule.optionsToString(element.rule.options),
        })
          .then((res) => {
            setTheArray((x) => [...x, res]);
          })
          .catch(() => {});
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardData]);

  return (
    <PageFormSection singleColumn title={t('Preview of the first 10 rules')} canCollapse>
      {theArray?.map((element, index) => {
        return (
          <>
            <Title key={index} headingLevel={'h4'}>
              {t(`Rule ${index + 1}`)}
            </Title>
            <DescriptionList isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Rule preview')}</DescriptionListTerm>
                <LabelGroup numLabels={5}>
                  {element?.local?.map((value, i) => {
                    return <Label key={i}>{formatDateString(value)}</Label>;
                  })}
                </LabelGroup>
                <DescriptionListTerm>{t('Rrule')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {RRule.optionsToString(theRulesArray[index].rule.options)}
                </DescriptionListDescription>
                <Divider />
              </DescriptionListGroup>
            </DescriptionList>
          </>
        );
      })}
    </PageFormSection>
  );
}
