import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { PageApp } from '../../framework/PageNavigation/PageApp';
import { AnsibleMasthead } from '../common/Masthead';
import '../common/i18n';
import { useAwxNavigation } from './useAwxNavigation';

export default function AwxMain() {
  const awxNavigation = useAwxNavigation();
  return <PageApp header={<AnsibleMasthead />} navigationItems={awxNavigation} />;
}
