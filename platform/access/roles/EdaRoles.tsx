import { Divider, PageSection, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { EdaRolesTable } from '../../../frontend/eda/UserAccess/Roles/Roles';

export function EdaRoles() {
  const { t } = useTranslation();
  return (
    <>
      <PageSection variant="light" isWidthLimited hasOverflowScroll>
        <TextContent>
          <Text component={TextVariants.h2}>{t('Overview')}</Text>
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
      <EdaRolesTable />
    </>
  );
}
