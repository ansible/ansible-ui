import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  List,
  ListItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { Masonry } from '../../../../framework/PageMasonry';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { AwxError } from '../../common/AwxError';
import { AwxRoute } from '../../main/AwxRoutes';
import { useAwxSettingsGroups } from './useAwxSettingsGroups';

export function AwxSettings() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { isLoading, error, groups } = useAwxSettingsGroups();
  if (error) return <AwxError error={error} />;
  if (isLoading || !groups) return <LoadingPage />;
  return (
    <PageLayout>
      <PageHeader title={t('Settings')} headerActions={<ActivityStreamIcon type={'setting'} />} />
      <PageSection>
        <Masonry minSize={500}>
          {groups.map((group) => (
            <Card isRounded isFlat key={group.name}>
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h3">{group.name}</Title>
                </CardTitle>
                {group.description && <p>{group.description}</p>}
              </CardHeader>
              <CardBody>
                <List isPlain>
                  {group.categories.map((category) => (
                    <ListItem key={category.name}>
                      <Link
                        to={getPageUrl(AwxRoute.SettingsCategory, {
                          params: { category: category.id },
                        })}
                      >
                        {category.name}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>
          ))}
        </Masonry>
      </PageSection>
    </PageLayout>
  );
}
