import { SetStateAction, useEffect, useMemo, useState } from 'react';
import {
  ITableColumn,
  LoadingPage,
  PageTable,
  TextCell,
  useInMemoryView,
} from '../../../../framework';
import { useTranslation } from 'react-i18next';
import { UserAssignment } from '../interfaces/UserAssignment';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { useGet } from '../../crud/useGet';
import { getItemKey } from '../../crud/Data';
import { Badge, Divider, ExpandableSection } from '@patternfly/react-core';
import styled from 'styled-components';

type OrgRolesListBaseProps = {
  isExpandable?: boolean;
  title?: string;
  isLastSection?: boolean;
  apiPrefixFunction: (strings: TemplateStringsArray, ...values: string[]) => string;
};
type OrgRolesListEmptyProps = {
  listId: number;
  setOrgListIsEmpty: (value: SetStateAction<boolean[]>) => void;
};
type UserOrgRolesListPropsWithId = OrgRolesListBaseProps & {
  orgId: string;
  userId: string;
};
type TeamOrgRolesListPropsWithId = OrgRolesListBaseProps & {
  orgId: string;
  teamId: string;
};
type UserOrgRolesListPropsWithAnsibleId = OrgRolesListBaseProps & {
  orgAnsibleId: string;
  userAnsibleId: string;
};
type TeamOrgRolesListPropsWithAnsibleId = OrgRolesListBaseProps & {
  orgAnsibleId: string;
  teamAnsibleId: string;
};
export type OrgRolesListProps =
  | UserOrgRolesListPropsWithId
  | TeamOrgRolesListPropsWithId
  | UserOrgRolesListPropsWithAnsibleId
  | TeamOrgRolesListPropsWithAnsibleId;

const StyledBadge = styled(Badge)`
  margin-left: var(--pf-v5-global--spacer--sm);
`;

const StyledDivider = styled(Divider)`
  margin: var(--pf-v5-global--spacer--md) 0 var(--pf-v5-global--spacer--md) 0;
`;
/**
 * Displays a list of the org-level roles associated with a user/team
 */
export function OrgRolesList(props: OrgRolesListProps & OrgRolesListEmptyProps) {
  const { title, apiPrefixFunction, isExpandable, isLastSection, listId, setOrgListIsEmpty } =
    props;
  const { teamId } = props as TeamOrgRolesListPropsWithId;
  const { userId } = props as UserOrgRolesListPropsWithId;
  const { userAnsibleId } = props as UserOrgRolesListPropsWithAnsibleId;
  const { teamAnsibleId } = props as TeamOrgRolesListPropsWithAnsibleId;
  const [isExpanded, setIsExpanded] = useState(true);
  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };
  const { t } = useTranslation();
  const apiUrl = useMemo<string>(() => {
    if ((props as TeamOrgRolesListPropsWithId).orgId && teamId) {
      return apiPrefixFunction`/role_team_assignments/?team_id=${teamId}&object_id=${(props as TeamOrgRolesListPropsWithId).orgId}`;
    } else if ((props as UserOrgRolesListPropsWithId).orgId && userId) {
      return apiPrefixFunction`/role_user_assignments/?user_id=${userId}&object_id=${(props as UserOrgRolesListPropsWithId).orgId}`;
    } else if ((props as UserOrgRolesListPropsWithAnsibleId).orgAnsibleId && userAnsibleId) {
      return apiPrefixFunction`/role_user_assignments/?user_ansible_id=${userAnsibleId}&object_ansible_id=${(props as UserOrgRolesListPropsWithAnsibleId).orgAnsibleId}`;
    } else if ((props as TeamOrgRolesListPropsWithAnsibleId).orgAnsibleId && teamAnsibleId) {
      return apiPrefixFunction`/role_team_assignments/?team_ansible_id=${teamAnsibleId}&object_ansible_id=${(props as TeamOrgRolesListPropsWithAnsibleId).orgAnsibleId}`;
    }
    return '';
  }, [apiPrefixFunction, props, teamAnsibleId, teamId, userAnsibleId, userId]);

  const { data, isLoading, error } = useGet<{ results: TeamAssignment[] | UserAssignment[] }>(
    apiUrl
  );

  const tableColumns: ITableColumn<TeamAssignment | UserAssignment>[] = useMemo(
    () => [
      {
        header: t('Name'),
        cell: (item) => <TextCell text={item.summary_fields.role_definition.name} />,
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      {
        header: t('Description'),
        cell: (item) => <TextCell text={item.summary_fields.role_definition.description} />,
        card: 'description',
        list: 'description',
      },
    ],
    [t]
  );
  const items = useMemo(() => data?.results ?? [], [data?.results]);
  const view = useInMemoryView<TeamAssignment | UserAssignment>({
    keyFn: getItemKey,
    items: items,
    tableColumns,
    error,
  });

  useEffect(() => {
    if (!isLoading && !error) {
      if (data?.results.length === 0) {
        setOrgListIsEmpty((orgsList) => {
          orgsList[listId] = true;
          return [...orgsList];
        });
      } else if (data?.results.length) {
        setOrgListIsEmpty((orgsList) => {
          orgsList[listId] = false;
          return [...orgsList];
        });
      }
    }
  }, [data?.results.length, error, isLoading, listId, setOrgListIsEmpty]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isLoading && !error && data?.results.length === 0) {
    return null;
  }

  return (
    <>
      {isExpandable && (
        <>
          <ExpandableSection
            data-cy={
              title
                ? `expandable-org-roles-${title.replace(/\s+/g, '-').toLowerCase()}`
                : 'expandable-org-roles'
            }
            toggleContent={
              title ? (
                <div>
                  <span>{title}</span>
                  <StyledBadge isRead>{data?.results?.length}</StyledBadge>
                </div>
              ) : undefined
            }
            onToggle={onToggle}
            isExpanded={isExpanded}
          >
            <PageTable<TeamAssignment | UserAssignment>
              {...view}
              tableColumns={tableColumns}
              errorStateTitle={t('Error loading roles.')}
              emptyStateTitle={t('There are currently no roles assigned.')}
              disablePagination
              disableLastRowBorder
              compact
              borderless
            />
          </ExpandableSection>
          {isLastSection ? null : <StyledDivider />}
        </>
      )}
      {!isExpandable && (
        <>
          <PageTable<TeamAssignment | UserAssignment>
            {...view}
            tableColumns={tableColumns}
            errorStateTitle={t('Error loading roles.')}
            emptyStateTitle={t('There are currently no roles assigned.')}
            disablePagination
            disableLastRowBorder
            compact
            borderless
          />
          {isLastSection ? null : <StyledDivider />}
        </>
      )}
    </>
  );
}
