import { Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn } from '../../../../../framework';
import { IconWrapper } from '../../../../../framework/components/IconWrapper';
import { usePageNavigate } from '../../../../../framework/components/usePageNavigate';
import { RouteObj } from '../../../../Routes';

export function useProjectNameColumn() {
  const { t } = useTranslation();
  const navigate = usePageNavigate();
  const column: ITableColumn<{
    name: string;
    default_environment?: string | null;
    custom_virtualenv?: string | null;
    id: number;
  }> = useMemo(
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
                <a href={RouteObj.ProjectDetails.replace(':id', project.id.toString())}>
                  {project.name}
                </a>
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
            <a
              href={RouteObj.ProjectDetails.replace(':id', project.id.toString())}
              onClick={(e) => {
                e.preventDefault();
                navigate(RouteObj.ProjectDetails.replace(':id', project.id.toString()));
              }}
            >
              {project.name}
            </a>
          </div>
        ),
      sort: 'name',
      card: 'name',
      list: 'name',
      defaultSort: true,
    }),
    [navigate, t]
  );
  return column;
}
