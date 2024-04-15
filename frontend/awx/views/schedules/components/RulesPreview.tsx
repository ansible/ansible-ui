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
import { PageWizardStep } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { ScheduleFormWizard } from '../types';
import { RRule } from 'rrule';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

export function RulesPreview() {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as {
    wizardData: WizardFormValues & ScheduleFormWizard;
    visibleSteps: PageWizardStep[];
  };

  return (
    <PageFormSection singleColumn title={t('Preview of the first 10 rules')} canCollapse>
      {wizardData.rules?.map((element, index) => {
        const newRule = new RRule(element.rule.options);
        return (
          <>
            <Title key={index} headingLevel={'h4'}>
              {t(`Rule ${index + 1}`)}
            </Title>
            <DescriptionList data-cy={`rule-${element.id}`} isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Rule preview')}</DescriptionListTerm>
                <LabelGroup numLabels={5}>
                  {newRule
                    .all((_rule, i) => i < 10)
                    ?.map((value, i) => {
                      return <Label key={i}>{formatDateString(value)}</Label>;
                    })}
                </LabelGroup>
                <DescriptionListTerm>{t('Rrule')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {RRule.optionsToString(element.rule.options)}
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
