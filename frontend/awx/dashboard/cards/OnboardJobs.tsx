import {
  Button,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Split,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';

export function OnboardJobs(props: { count: number | undefined }) {
  const { t } = useTranslation();
  const { count } = props;
  if (count === undefined || count >= 1) return <></>;
  return (
    <PageDashboardCard>
      <CardHeader>
        <CardTitle>{t('Create your first job template')}</CardTitle>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          <StackItem>{t('To get started, create your first job template.')}</StackItem>
        </Stack>
      </CardBody>
      <CardFooter>
        <Split hasGutter>
          <Button>{t('Create job template')}</Button>
        </Split>
      </CardFooter>
    </PageDashboardCard>
  );
}
