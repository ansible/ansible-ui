import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { PageApp } from '../../framework/PageNavigation/PageApp';
import { AnsibleMasthead } from '../common/Masthead';
import '../common/i18n';
import { useEdaNavigation } from './useEdaNavigation';

export default function EdaMain() {
  const navigation = useEdaNavigation();
  return <PageApp header={<AnsibleMasthead />} navigation={navigation} />;
}
