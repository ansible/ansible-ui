import { Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ITableColumn } from '../../../../../framework';
import { IconWrapper } from '../../../../../framework/components/IconWrapper';
import { RouteObj } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';

export function useProjectNameColumn(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const { disableLinks } = options ?? {};
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
                  <Link to={RouteObj.ProjectDetails.replace(':id', project.id.toString())}>
                    {project.name}
                  </Link>
                )}
              </div>
            </SplitItem>
            <SplitItem>
              <Tooltip
                content={t`Custom virtual environment ${project.custom_virtualenv} must be replaced by an execution environment.`}
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
              <Link to={RouteObj.ProjectDetails.replace(':id', project.id.toString())}>
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
    [t, disableLinks]
  );
  return column;
}
