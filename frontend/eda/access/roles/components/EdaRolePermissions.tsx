import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
} from '@patternfly/react-core';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { ContentTypeEnum } from '../../../interfaces/generated/eda-api';
import { useEdaRoleMetadata } from '../hooks/useEdaRoleMetadata';

export function EdaRolePermissions(props: { role: EdaRbacRole }) {
  const { role } = props;
  const rolesMetadata = useEdaRoleMetadata();

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
        {role.content_type && (
          <>
            <DescriptionListTerm
              data-cy={role.content_type}
              style={{ fontWeight: 'normal' }}
              key={role.content_type}
            >
              {rolesMetadata.content_types[role.content_type]?.displayName || role.content_type}
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
        )}
      </DescriptionListGroup>
    </DescriptionList>
  );
}
