/**
 * InsightsAccessTab - Access management tab for Insights/CRC mode
 *
 * This is a presentational component that displays users and groups with their
 * assigned roles in expandable rows. It replicates the functionality of the
 * legacy ansible-hub-ui access tab.
 *
 * Data fetching should be handled by the parent component.
 */
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  PageSection,
  Title,
  Label,
  LabelGroup,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr, ExpandableRowContent } from '@patternfly/react-table';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserWithRoles, GroupWithRoles } from './api/pulp-rbac';

interface InsightsAccessTabProps {
  /** Users with their assigned roles */
  users: UserWithRoles[];
  /** Groups with their assigned roles */
  groups: GroupWithRoles[];
  /** The name of the resource (for display in empty state) */
  resourceName?: string;
}

export function InsightsAccessTab({ users, groups, resourceName }: InsightsAccessTabProps) {
  const { t } = useTranslation();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleUserExpansion = (username: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  };

  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const hasUsers = users && users.length > 0;
  const hasGroups = groups && groups.length > 0;
  const noData = !hasUsers && !hasGroups;

  if (noData) {
    return (
      <PageSection>
        <EmptyState variant={EmptyStateVariant.lg}>
          <Title headingLevel="h4" size="lg">
            {t('No access configured')}
          </Title>
          <EmptyStateBody>
            {t('There are currently no users or groups with access to this resource.')}
            {resourceName && (
              <>
                <br />
                {t('Resource: {{name}}', { name: resourceName })}
              </>
            )}
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection>
      {/* Users Section */}
      {hasUsers && (
        <>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
            {t('Users')}
          </Title>
          <Table aria-label={t('Users with access')} variant="compact">
            <Thead>
              <Tr>
                <Th screenReaderText={t('Expand')} />
                <Th>{t('Username')}</Th>
                <Th>{t('Roles')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => {
                const isExpanded = expandedUsers.has(user.username);
                return (
                  <React.Fragment key={user.username}>
                    <Tr>
                      <Td
                        expand={{
                          rowIndex: 0,
                          isExpanded,
                          onToggle: () => toggleUserExpansion(user.username),
                          expandId: `user-${user.username}`,
                        }}
                      />
                      <Td dataLabel={t('Username')}>{user.username}</Td>
                      <Td dataLabel={t('Roles')}>
                        <LabelGroup>
                          {user.object_roles.map((role) => (
                            <Label key={role} color="blue">
                              {role}
                            </Label>
                          ))}
                        </LabelGroup>
                      </Td>
                    </Tr>
                    {isExpanded && (
                      <Tr isExpanded={isExpanded}>
                        <Td colSpan={3}>
                          <ExpandableRowContent>
                            <div style={{ padding: '1rem' }}>
                              <Title headingLevel="h4" size="md">
                                {t('Assigned Roles for {{username}}', {
                                  username: user.username,
                                })}
                              </Title>
                              <ul style={{ marginTop: '0.5rem' }}>
                                {user.object_roles.map((role) => (
                                  <li key={role}>{role}</li>
                                ))}
                              </ul>
                            </div>
                          </ExpandableRowContent>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
        </>
      )}

      {/* Separator between sections */}
      {hasUsers && hasGroups && (
        <div
          style={{
            backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
            height: '16px',
            margin: '24px -24px',
          }}
        />
      )}

      {/* Groups Section */}
      {hasGroups && (
        <>
          <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
            {t('Groups')}
          </Title>
          <Table aria-label={t('Groups with access')} variant="compact">
            <Thead>
              <Tr>
                <Th screenReaderText={t('Expand')} />
                <Th>{t('Group name')}</Th>
                <Th>{t('Roles')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {groups.map((group) => {
                const isExpanded = expandedGroups.has(group.name);
                return (
                  <React.Fragment key={group.name}>
                    <Tr>
                      <Td
                        expand={{
                          rowIndex: 0,
                          isExpanded,
                          onToggle: () => toggleGroupExpansion(group.name),
                          expandId: `group-${group.name}`,
                        }}
                      />
                      <Td dataLabel={t('Group name')}>{group.name}</Td>
                      <Td dataLabel={t('Roles')}>
                        <LabelGroup>
                          {group.object_roles.map((role) => (
                            <Label key={role} color="green">
                              {role}
                            </Label>
                          ))}
                        </LabelGroup>
                      </Td>
                    </Tr>
                    {isExpanded && (
                      <Tr isExpanded={isExpanded}>
                        <Td colSpan={3}>
                          <ExpandableRowContent>
                            <div style={{ padding: '1rem' }}>
                              <Title headingLevel="h4" size="md">
                                {t('Assigned Roles for {{groupName}}', {
                                  groupName: group.name,
                                })}
                              </Title>
                              <ul style={{ marginTop: '0.5rem' }}>
                                {group.object_roles.map((role) => (
                                  <li key={role}>{role}</li>
                                ))}
                              </ul>
                            </div>
                          </ExpandableRowContent>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
        </>
      )}
    </PageSection>
  );
}
