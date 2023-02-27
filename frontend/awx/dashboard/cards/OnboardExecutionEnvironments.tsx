import {
  Button,
  CardBody,
  CardFooter,
  CardTitle,
  Split,
  Stack,
  Text,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';

export function OnboardExecutionEnvironments(props: { count: number | undefined }) {
  const { t } = useTranslation();
  const { count } = props;
  if (count === undefined || count >= 1) return <></>;
  return (
    <PageDashboardCard>
      <CardTitle>
        {t('Create or sync an execution environment')}
        {/* <Help
          title="Execution environments"
          help="The ability to build and deploy Python virtual environments for automation has been replaced by
                Ansible execution environments. Unlike legacy virtual environments, execution environments are
                container images that make it possible to incorporate system-level dependencies and collection-based
                content. Each execution environment allows you to have a customized image to run jobs, and each of
                them contain only what you need when running the job, nothing more."
        /> */}
      </CardTitle>
      <CardBody>
        <Stack hasGutter>
          <Text>{t('Sync from the available execution environments or create your own.')}</Text>
        </Stack>
      </CardBody>
      <CardFooter>
        <Split hasGutter>
          <Button>{t('Create execution environment')}</Button>
          <Button>{t('Browse available execution environments')}</Button>
        </Split>
      </CardFooter>
    </PageDashboardCard>
  );
}
