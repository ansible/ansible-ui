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

export function RulesPreview(props: { rrule?: string }) {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as {
    wizardData: WizardFormValues & ScheduleFormWizard;
    visibleSteps: PageWizardStep[];
  };

  return (
    <PageFormSection singleColumn title={t('Preview of the first 10 rules')} canCollapse>
      {!props.rrule ? (
        wizardData.rules?.map((element, index) => {
          return <RulesPreviewBody ruleObject={element.rule.options} key={index} index={index} />;
        })
      ) : (
        <RulesPreviewBody ruleString={props.rrule} />
      )}
    </PageFormSection>
  );
}

export function RulesPreviewBody(props: {
  ruleString?: string;
  ruleObject?: Options;
  index?: number;
}) {
  const { t } = useTranslation();
  let newRule;
  const rRuleArray = [] as RRule[];

  if (props.ruleString) {
    const rRruleString = rrulestr(props.ruleString, { forceset: true }) as RRuleSet;
    rRruleString._rrule.map((value: RRule) => {
      const rRule = value.options as Options;
      newRule = new RRule(rRule);
      rRuleArray.push(newRule);
    });
  } else {
    newRule = new RRule(props.ruleObject);
    rRuleArray.push(newRule);
  }

  return (
    <>
      {rRuleArray.map((rule, index) => {
        return (
          <>
            <Title headingLevel={'h4'}>
              {props.index ? t(`Rule ${props.index + 1}`) : t(`Rule ${index + 1}`)}
            </Title>
            <DescriptionList
              data-cy={props.index ? `rule-${props.index + 1}` : `rule-${index + 1}`}
              isCompact
            >
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Rule preview')}</DescriptionListTerm>
                <LabelGroup numLabels={5}>
                  {rule
                    .all((_rule, i) => i < 10)
                    ?.map((value, i) => {
                      return <Label key={i}>{formatDateString(value)}</Label>;
                    })}
                </LabelGroup>
                <DescriptionListTerm>{t('RRuleSet')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {RRule.optionsToString(rule.options)}
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
