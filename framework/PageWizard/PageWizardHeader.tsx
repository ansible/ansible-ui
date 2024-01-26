import styled from 'styled-components';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import { css } from '@patternfly/react-styles';
import { Button } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

const WizardHeader = styled.div`
  background-color: var(--pf-v5-global--BackgroundColor--light-100);
  color: var(--pf-v5-global--Color--dark-100);

  .pf-v5-c-wizard__close button {
    color: var(--pf-v5-global--Color--dark-200);
    &:hover {
      color: var(--pf-v5-global--Color--dark-100);
    }
  }
`;

export function PageWizardHeader(props: { title: React.ReactNode; onClose?: () => void }) {
  const { t } = useTranslation();
  return (
    <WizardHeader className={css([styles.wizardHeader, 'border-bottom'])}>
      <div className={css(styles.wizardTitle)}>
        <h2 data-cy="wizard-title" className={css(styles.wizardTitleText)}>
          {props.title}
        </h2>
      </div>
      {props.onClose && (
        <div className={css(styles.wizardClose)}>
          <Button
            data-cy="wizard-close"
            variant="plain"
            aria-label={t('Close wizard')}
            onClick={props.onClose}
          >
            <TimesIcon aria-hidden="true" />
          </Button>
        </div>
      )}
    </WizardHeader>
  );
}
