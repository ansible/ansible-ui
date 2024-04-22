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
import { RRuleSet } from 'rrule';
import { DateTime } from 'luxon';

export function RulesPreview(props: { ruleSet?: RRuleSet }) {
  const { t } = useTranslation();
  const ruleSet = props.ruleSet ?? new RRuleSet();

  return (
    <PageFormSection singleColumn title={t('Preview of the first 10 rules')} canCollapse>
      <RulesPreviewBody ruleSet={ruleSet} />
    </PageFormSection>
  );
}

export function RulesPreviewBody(props: { ruleSet: RRuleSet }) {
  const { t } = useTranslation();

  return (
    <>
      {props.ruleSet.rrules().map((rule, index) => {
        return (
          <>
            <Title headingLevel={'h4'}>{t(`Rule ${index + 1}`)}</Title>
            <DescriptionList data-cy={`rule-${index + 1}`} isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Rule preview local')}</DescriptionListTerm>
                <LabelGroup numLabels={5}>
                  {rule
                    .all((_rule, i) => i < 10)
                    ?.map((value, i) => {
                      const localDateTime = DateTime.fromISO(value.toISOString())
                        .toUTC()
                        .toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);

                      return <Label key={i}>{localDateTime}</Label>;
                    })}
                </LabelGroup>
                <DescriptionListTerm>{t('RRule')}</DescriptionListTerm>
                <DescriptionListDescription>{rule.toString()}</DescriptionListDescription>
                <Divider />
              </DescriptionListGroup>
            </DescriptionList>
          </>
        );
      })}
      {props.ruleSet.exrules().map((exrule, index) => {
        return (
          <>
            <Title headingLevel={'h4'}>{t(`Exrule ${index + 1}`)}</Title>
            <DescriptionList data-cy={`exrule-${index + 1}`} isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Dates excluded from schedule')}</DescriptionListTerm>
                <LabelGroup numLabels={5}>
                  {exrule
                    .all((_rule, i) => i < 10)
                    ?.map((value, i) => {
                      const localDateTime = DateTime.fromISO(value.toISOString())
                        .toUTC()
                        .toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);

                      return <Label key={i}>{localDateTime}</Label>;
                    })}
                </LabelGroup>
                <DescriptionListTerm>{t('ExRule')}</DescriptionListTerm>
                <DescriptionListDescription>{exrule.toString()}</DescriptionListDescription>
                <Divider />
              </DescriptionListGroup>
            </DescriptionList>
          </>
        );
      })}
    </>
  );
}
