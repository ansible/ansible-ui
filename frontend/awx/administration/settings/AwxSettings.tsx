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
import { AwxError } from '../../common/AwxError';
import { AwxRoute } from '../../main/AwxRoutes';
import { useAwxSettingsGroups } from './useAwxSettingsGroups';

export function AwxSettings() {
  const { t } = useTranslation();
  const { isLoading, error, groups } = useAwxSettingsGroups();
  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} />;
  if (isLoading || !groups) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader title={t('Settings')} />
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

// export function useSettingsGroups() {
//   const options = useOptions<OptionsResponse>(awxAPI`/settings/all/`);
//   const all = useGet<{ results: { url: string; slug: string; name: string }[] }>(
//     awxAPI`/settings/all`
//   );
//   const isLoading = options.isLoading || all.isLoading;
//   const error = options.error || all.error;
//   const groups = useMemo(() => {
//     const groups: {
//       name: string;
//       categories: {
//         name: string;
//         slugs: {
//           slug: string;
//           options: OptionsAction<unknown>[];
//         }[];
//       }[];
//     }[] = [];
//     if (!options.data) return groups;
//     for (const optionKey in options.data.actions.PUT) {
//       const option = options.data.actions.PUT[optionKey];
//       const groupInfo = groupInfos.find((group) => group.categories.includes(option.category));
//       // const groupName = groupInfo ? groupInfo.name : option.category;
//       const groupName = groupInfo ? groupInfo.name : 'System';
//       let group = groups.find((group) => group.name === groupName);
//       if (!group) {
//         group = { name: groupName, categories: [] };
//         groups.push(group);
//       }
//       let category = group.categories.find((category) => category.name === option.category);
//       if (!category) {
//         category = { name: option.category, slugs: [] };
//         group.categories.push(category);
//       }
//       let slug = category.slugs.find((slug) => slug.slug === option.category_slug);
//       if (!slug) {
//         slug = { slug: option.category_slug, options: [] };
//         category.slugs.push(slug);
//       }
//       slug.options.push(option);
//     }

//     groups.forEach((group) => {
//       group.categories.sort((a, b) => a.name.localeCompare(b.name));
//     });

//     return groups;
//   }, [options.data]);
//   return { isLoading, error, groups };
// }
