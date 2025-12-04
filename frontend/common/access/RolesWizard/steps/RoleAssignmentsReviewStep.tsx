import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Badge, Divider, ExpandableSection, Title } from '@patternfly/react-core';
import {
  ITableColumn,
  PageDetail,
  PageDetails,
  PageTable,
  TextCell,
  useInMemoryView,
} from '@ansible/ansible-ui-framework';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useContentTypeComponentNames } from '@ansible/platform-ui/access/roles/hooks/useContentTypeComponentNames';
import { ContentType } from '@ansible/platform-ui/access/roles/hooks/ContentType';
import { useMapContentTypeToDisplayName } from '../../hooks/useMapContentTypeToDisplayName';

type ResourceTypeWithID = {
  id: number | string;
  name: string;
  description?: string;
  username?: never;
};
type ResourceTypeWithPulpHref = {
  pulp_href: string;
  name: string;
  description?: string;
  username?: never;
};
type Team = { id: number; name: string; username?: never };
type User = { id: number; name?: never; username: string };
type Role = {
  id: number;
  name: string;
  description?: string;
  username?: never;
  content_type?: string;
};

type ReviewData = {
  resourceType?: string;
  resources?: (ResourceTypeWithID | ResourceTypeWithPulpHref)[];
  edaRoles?: Role[];
  awxRoles?: Role[];
  hubRoles?: Role[];
  platformRoles?: Role[];
  teams?: Team[];
  users?: User[];
};

interface ReviewExpandableListProps<
  K extends ResourceTypeWithID | ResourceTypeWithPulpHref | Team | User,
> {
  selectedItems: K[];
  label?: string;
  fieldName: string;
  edaRolesLabel?: string;
  awxRolesLabel?: string;
  hubRolesLabel?: string;
  platformRolesLabel?: string;
}

const StyledBadge = styled(Badge)`
  margin-left: var(--pf-t--global--spacer--sm);
`;
const StyledDivider = styled(Divider)`
  margin: var(--pf-t--global--spacer--md) 0 var(--pf-t--global--spacer--md) 0;
`;

export function RoleAssignmentsReviewStep(props: {
  edaRolesLabel?: string;
  awxRolesLabel?: string;
  hubRolesLabel?: string;
  platformRolesLabel?: string;
  selectedUser?: { id: number; name?: never; username: string };
  selectedTeam?: { id: number; name: string; username?: never };
}) {
  const { wizardData } = usePageWizard();
  const { t } = useTranslation();
  const { resourceType, resources, users, teams, edaRoles, awxRoles, hubRoles, platformRoles } =
    wizardData as ReviewData;
  const getDisplayName = useMapContentTypeToDisplayName();

  return (
    <>
      <Title headingLevel="h1">{t('Review')}</Title>
      {resourceType ? (
        <>
          <div
            style={{
              marginTop: 'var(--pf-t--global--spacer--lg)',
            }}
          >
            <PageDetails disablePadding>
              <PageDetail label={t('Resource type')}>
                {getDisplayName(resourceType, { isTitleCase: true })}
              </PageDetail>
            </PageDetails>
          </div>
          <StyledDivider className="pf-v6-u-mb-xl" />
        </>
      ) : null}
      {props.selectedUser ? (
        <>
          <div
            style={{
              marginTop: 'var(--pf-t--global--spacer--lg)',
            }}
          >
            <PageDetails disablePadding>
              <PageDetail label={t('User')}>{props.selectedUser.username}</PageDetail>
            </PageDetails>
          </div>
          <StyledDivider className="pf-v6-u-mb-xl" />
        </>
      ) : null}
      {props.selectedTeam ? (
        <>
          <div
            style={{
              marginTop: 'var(--pf-t--global--spacer--lg)',
            }}
          >
            <PageDetails disablePadding>
              <PageDetail label={t('Team')}>{props.selectedTeam.name}</PageDetail>
            </PageDetails>
          </div>
          <StyledDivider className="pf-v6-u-mb-xl" />
        </>
      ) : null}
      {resources?.length ? (
        <>
          <ReviewExpandableList selectedItems={resources} fieldName="resources" />
          <StyledDivider />
        </>
      ) : null}
      {users?.length ? (
        <>
          <ReviewExpandableList selectedItems={users} fieldName="users" />
          <StyledDivider />
        </>
      ) : null}
      {teams?.length ? (
        <>
          <ReviewExpandableList selectedItems={teams} fieldName="teams" />
          <StyledDivider />
        </>
      ) : null}
      {edaRoles?.length ? (
        <ReviewExpandableList selectedItems={edaRoles} fieldName="edaRoles" {...props} />
      ) : null}
      {awxRoles?.length ? (
        <ReviewExpandableList selectedItems={awxRoles} fieldName="awxRoles" {...props} />
      ) : null}
      {hubRoles?.length ? (
        <ReviewExpandableList selectedItems={hubRoles} fieldName="hubRoles" {...props} />
      ) : null}
      {platformRoles?.length ? (
        <ReviewExpandableList selectedItems={platformRoles} fieldName="platformRoles" {...props} />
      ) : null}
    </>
  );
}

function ReviewExpandableList<
  K extends ResourceTypeWithID | ResourceTypeWithPulpHref | Team | User,
>(props: ReviewExpandableListProps<K>) {
  const {
    label,
    selectedItems,
    fieldName,
    edaRolesLabel,
    awxRolesLabel,
    hubRolesLabel,
    platformRolesLabel,
  } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };
  const { t } = useTranslation();
  const getContentTypeComponentNames = useContentTypeComponentNames();
  const labelForSelectedItems = useMemo(() => {
    if (label) {
      return label;
    }
    switch (fieldName) {
      case 'users':
        return t('Users');
      case 'teams':
        return t('Teams');
      case 'resources':
        return t('Resources');
      case 'edaRoles':
        return edaRolesLabel || t('Roles');
      case 'awxRoles':
        return awxRolesLabel || t('Roles');
      case 'hubRoles':
        return hubRolesLabel || t('Roles');
      case 'platformRoles':
        return platformRolesLabel || t('Roles');
      default:
        return '';
    }
  }, [awxRolesLabel, edaRolesLabel, hubRolesLabel, platformRolesLabel, fieldName, label, t]);

  const tableColumns: ITableColumn<K>[] = useMemo(() => {
    const renderUsernameCell = (user: K) => <TextCell text={user?.username} />;
    const renderNameCell = (item: K) => <TextCell text={item.name} />;
    const renderDescriptionCell = (role: K) => {
      const description = (role as Role).description;
      return description ? <TextCell text={description} /> : null;
    };

    switch (fieldName) {
      case 'users':
        return [
          {
            header: t('Username'),
            cell: renderUsernameCell,
            card: 'name',
            list: 'name',
            sort: 'username',
            maxWidth: 200,
          },
        ];
      case 'awxRoles':
      case 'edaRoles':
      case 'hubRoles':
      case 'platformRoles':
        return [
          {
            header: t('Name'),
            cell: renderNameCell,
            card: 'name',
            list: 'name',
            sort: 'name',
          },
          {
            header: t('Description'),
            cell: renderDescriptionCell,
            card: 'description',
            list: 'description',
          },
          {
            header: t('Component'),
            type: 'labels',
            value: (role: K) =>
              getContentTypeComponentNames(((role as Role).content_type ?? '') as ContentType),
          },
        ];
      default:
        return [
          {
            header: t('Name'),
            cell: renderNameCell,
            card: 'name',
            list: 'name',
            sort: 'name',
          },
        ];
    }
  }, [fieldName, t, getContentTypeComponentNames]);

  const view = useInMemoryView<K>({
    keyFn: (item) => {
      if ((item as ResourceTypeWithPulpHref).pulp_href) {
        return (item as ResourceTypeWithPulpHref).pulp_href;
      }
      return (item as ResourceTypeWithID | Team | Role | User).id;
    },
    items: selectedItems,
    tableColumns,
    disableQueryString: true,
  });

  if (view?.itemCount === 0) {
    return null;
  }

  return (
    <ExpandableSection
      data-cy={`expandable-section-${fieldName}`}
      data-testid={`expandable-section-${fieldName}`}
      toggleContent={
        <div>
          <span>{labelForSelectedItems}</span>
          <StyledBadge isRead>{selectedItems.length}</StyledBadge>
        </div>
      }
      onToggle={onToggle}
      isExpanded={isExpanded}
    >
      <PageTable<K>
        {...view}
        tableColumns={tableColumns}
        errorStateTitle="NEVER"
        emptyStateTitle="NEVER"
        defaultSubtitle={t('Role')}
        disablePagination
        disableLastRowBorder
        compact
        borderless
      />
    </ExpandableSection>
  );
}
