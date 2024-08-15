import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
} from '@patternfly/react-core';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { useHubRoleMetadata } from '../hooks/useHubRoleMetadata';
import { ContentTypeEnum } from '../../../interfaces/expanded/ContentType';
import { useTranslation } from 'react-i18next';

export function HubRolePermissions(props: { role: HubRbacRole }) {
  const { t } = useTranslation();
  const { role } = props;
  const rolesMetadata = useHubRoleMetadata();

  return (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{
        default: '12ch',
        sm: '15ch',
        md: '20ch',
        lg: '28ch',
        xl: '30ch',
        '2xl': '35ch',
      }}
      data-cy="permissions-description-list"
    >
      <DescriptionListGroup key={role?.content_type}>
        {
          <>
            <DescriptionListTerm
              data-cy={role.content_type}
              style={{ fontWeight: 'normal' }}
              key={role.content_type}
            >
              {role.content_type === null
                ? t('System')
                : rolesMetadata.content_types[role.content_type]?.displayName || role.content_type}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {!!role?.permissions.length && (
                <LabelGroup numLabels={3}>
                  {role?.permissions.map((permission: string) => {
                    return (
                      <Label key={permission} data-cy={permission}>
                        {rolesMetadata.content_types[role.content_type as ContentTypeEnum]
                          ?.permissions[permission] || permission}
                      </Label>
                    );
                  })}
                </LabelGroup>
              )}
            </DescriptionListDescription>
          </>
        }
      </DescriptionListGroup>
    </DescriptionList>
  );
}
