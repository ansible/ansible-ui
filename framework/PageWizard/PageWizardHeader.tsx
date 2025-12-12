import { Button } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const WizardHeader = styled.div`
  background-color: var(--pf-t--global--background--color--primary--default);
  color: var(--pf-t--global--text--color--regular);

  .pf-v6-c-wizard__close button {
    color: var(--pf-t--global--text--color--regular);
  }
`;

export function PageWizardHeader(props: { title: React.ReactNode; onClose?: () => void }) {
  const { t } = useTranslation();
  return (
    <WizardHeader className={css([styles.wizardHeader])}>
      <div className={css(styles.wizardTitle)}>
        <h2
          data-cy="wizard-title"
          data-testid="wizard-title"
          className={css(styles.wizardTitleText)}
        >
          {props.title}
        </h2>
      </div>
      {props.onClose && (
        <div className={css(styles.wizardClose)}>
          <Button
            icon={<TimesIcon aria-hidden="true" />}
            data-cy="wizard-close"
            data-testid="wizard-close"
            variant="plain"
            aria-label={t('Close wizard')}
            onClick={props.onClose}
          />
        </div>
      )}
    </WizardHeader>
  );
}
