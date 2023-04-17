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

export function OnboardInventories(props: { count: number | undefined }) {
  const { t } = useTranslation();
  const { count } = props;
  if (count === undefined || count >= 1) return <></>;
  return (
    <PageDashboardCard width="xxl">
      <CardTitle>
        {t('Create an inventory')}
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
          <Text>{t('To get started, create an inventory.')}</Text>
        </Stack>
      </CardBody>
      <CardFooter>
        <Split hasGutter>
          <Button>{t('Create inventory')}</Button>
        </Split>
      </CardFooter>
    </PageDashboardCard>
  );
}
