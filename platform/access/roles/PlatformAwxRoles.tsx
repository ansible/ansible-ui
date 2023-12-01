import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageNotImplemented } from '../../../framework';

export function PlatformAwxRoles() {
  const { t } = useTranslation();
  // const awxRoles = useRolesMetadata();
  return (
    <>
      <Alert
        title={t('These roles only apply to resources in the context of automation execution.')}
        variant="info"
        style={{ borderTop: 0 }}
        className="border-bottom"
        isInline
        isExpandable
      >
        {t(
          'Automation execution roles are based on the type of resource access is being granted. When a user or team is granted access to a resource, the roles shown below can be selected. Some roles such a team member or some organization roles grant further access to the users and teams.'
        )}
      </Alert>
      <PageNotImplemented />

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
