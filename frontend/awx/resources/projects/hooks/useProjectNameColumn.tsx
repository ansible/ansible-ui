import { Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ITableColumn, useGetPageUrl } from '../../../../../framework';
import { IconWrapper } from '../../../../../framework/components/IconWrapper';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useProjectNameColumn(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const { disableLinks } = options ?? {};
  const getPageUrl = useGetPageUrl();
  const column = useMemo<ITableColumn<Project>>(
    () => ({
      header: t('Name'),
      cell: (project) =>
        project.custom_virtualenv && !project.default_environment ? (
          <Split>
            <SplitItem style={{ marginRight: '8px' }}>
              <div
                style={{
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {disableLinks ? (
                  project.name
                ) : (
                  <Link to={getPageUrl(AwxRoute.ProjectDetails, { params: { id: project.id } })}>
                    {project.name}
                  </Link>
                )}
              </div>
            </SplitItem>
            <SplitItem>
              <Tooltip
                content={t(
                  `Custom virtual environment {{venvName}} must be replaced by an execution environment.`,
                  { venvName: project.custom_virtualenv }
                )}
                position="right"
              >
                <IconWrapper size={'sm'} color={'warning'}>
                  <ExclamationTriangleIcon />
                </IconWrapper>
              </Tooltip>
            </SplitItem>
          </Split>
        ) : (
          <div
            style={{
              maxWidth: '100%',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {disableLinks ? (
              project.name
            ) : (
              <Link to={getPageUrl(AwxRoute.ProjectDetails, { params: { id: project.id } })}>
                {project.name}
              </Link>
            )}
          </div>
        ),
      sort: 'name',
      card: 'name',
      list: 'name',
      defaultSort: true,
    }),
    [t, disableLinks, getPageUrl]
  );
  return column;
}
