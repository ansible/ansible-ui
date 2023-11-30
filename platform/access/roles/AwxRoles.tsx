import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  PageSection,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageTab, PageTabs } from '../../../framework';
import { useRolesMetadata } from '../../../frontend/awx/access/roles/useRoleMetadata';

export function AwxRoles() {
  const { t } = useTranslation();
  const awxRoles = useRolesMetadata();
  return (
    <>
      <PageSection variant="light" isWidthLimited hasOverflowScroll>
        <TextContent>
          {/* <Text component={TextVariants.h2}>Overview</Text> */}
          <Text component={TextVariants.p}>
            {t(
              'Automation execution roles are based on the type of resource access is being granted. When a user or team is granted access to a resource, the roles shown below can be selected. Some roles such a team member or some organization roles grant further access to the users and teams.'
            )}
          </Text>
          <Text component={TextVariants.p}>
            {t(
              'Note: These permissions only apply to resources in the automation execution context.'
            )}
          </Text>
        </TextContent>
      </PageSection>
      <Divider />
      {/* <PageTabs>
        {Object.keys(awxRoles).map((key) => {
          const resourceType = awxRoles[key];
          return (
            <PageTab key={key} label={resourceType.name}>
              <PageSection variant="light">
                <DescriptionList isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Role')}</DescriptionListTerm>
                    <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
                  </DescriptionListGroup>
                  <Divider />
                  {Object.values(resourceType.roles).map((role) => {
                    return (
                      <DescriptionListGroup key={role.label}>
                        <DescriptionListTerm>{role.label}</DescriptionListTerm>
                        <DescriptionListDescription>{role.description}</DescriptionListDescription>
                      </DescriptionListGroup>
                    );
                  })}
                </DescriptionList>
              </PageSection>
            </PageTab>
          );
        })}
      </PageTabs> */}
    </>
  );
}
