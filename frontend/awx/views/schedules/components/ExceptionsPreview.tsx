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
import { RRule, RRuleSet, rrulestr } from 'rrule';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { Options } from 'rrule';

export function ExceptionsPreview(props: { rrule?: string }) {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as {
    wizardData: WizardFormValues & ScheduleFormWizard;
    visibleSteps: PageWizardStep[];
  };

  return (
    <PageFormSection singleColumn title={t('Preview of the first 10 exceptions')} canCollapse>
      {!props.rrule ? (
        wizardData.exceptions?.map((element, index) => {
          return (
            <ExceptionsPreviewBody key={index} ruleObject={element.rule.options} index={index} />
          );
        })
      ) : (
        <ExceptionsPreviewBody ruleString={props.rrule} />
      )}
    </PageFormSection>
  );
}

export function ExceptionsPreviewBody(props: {
  ruleString?: string;
  ruleObject?: Options;
  index?: number;
}) {
  const { t } = useTranslation();
  let newExRule;
  const exRuleArray = [] as RRule[];
  if (props.ruleString) {
    const exRruleString = rrulestr(props.ruleString) as RRuleSet;
    exRruleString._exrule.map((value: RRule) => {
      const exRule = value.options as Options;
      newExRule = new RRule(exRule);
      exRuleArray.push(newExRule);
    });
  } else {
    newExRule = new RRule(props.ruleObject);
    exRuleArray.push(newExRule);
  }

  return (
    <>
      {exRuleArray.map((exrule, index) => {
        return (
          <>
            <Title headingLevel={'h4'}>
              {props.index ? t(`Exception ${props.index + 1}`) : t(`Exception ${index + 1}`)}
            </Title>
            <DescriptionList data-cy={`exception-${index + 1}`} isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Exception preview')}</DescriptionListTerm>
                <LabelGroup numLabels={5}>
                  {exrule
                    .all((_rule, i) => i < 10)
                    ?.map((value, i) => {
                      return <Label key={i}>{formatDateString(value)}</Label>;
                    })}
                </LabelGroup>
                <DescriptionListTerm>{t('Exrule')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {RRule.optionsToString(exrule.options)}
                </DescriptionListDescription>
                <Divider />
              </DescriptionListGroup>
            </DescriptionList>
          </>
        );
      })}
    </>
  );
}
