import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretDownIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import { PageWizardContext } from './PageWizardProvider';

export default function PageWizardToggle() {
  const { t } = useTranslation();
  const { activeStep, isToggleExpanded, setToggleExpanded } = useContext(PageWizardContext);
  const toggleNavExpanded = useCallback(
    () => setToggleExpanded((isNavExpanded) => !isNavExpanded),
    [setToggleExpanded]
  );
  return (
    <button
      onClick={toggleNavExpanded}
      className={css(styles.wizardToggle, isToggleExpanded && 'pf-m-expanded')}
      aria-label={t('Wizard toggle')}
      aria-expanded={isToggleExpanded}
    >
      <span className={css(styles.wizardToggleList)}>
        <span className={css(styles.wizardToggleListItem)}>
          <span className={css(styles.wizardToggleNum)}>{1}</span> {activeStep?.label}
        </span>
      </span>
      <span className={css(styles.wizardToggleIcon)}>
        <CaretDownIcon aria-hidden="true" />
      </span>
    </button>
  );
}
