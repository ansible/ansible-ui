import { QuickStart } from '@patternfly/quickstarts';
import Test from './finding-content.json';

interface IPlatformQuickStart extends QuickStart {
  subtitle: string;
}
export const quickStarts: IPlatformQuickStart[] = [Test as IPlatformQuickStart];
