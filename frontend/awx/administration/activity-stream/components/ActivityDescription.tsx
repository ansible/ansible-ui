import { Link } from 'react-router-dom';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { useGetPageUrl } from '../../../../../framework';
import { useGetActivityStreamRoute } from '../hooks/useGetActivityStreamRoute';

interface ActivityStreamDescriptionProps {
  activity: ActivityStream;
}
type ActivityStreamResource = Omit<ActivityStream['summary_fields'], 'actor'>;

type ResourceKey = keyof ActivityStreamResource;

function getResourceName(activity: ActivityStream, resourceKey: ResourceKey): string {
  const resource = getResourceObject(activity, resourceKey);
  if (resource) {
    if ('name' in resource && typeof resource.name === 'string') {
      return resource.name;
    }
    if ('hostname' in resource && typeof resource.hostname === 'string') {
      return resource.hostname;
    }
    if ('username' in resource && typeof resource.username === 'string') {
      return resource.username;
    }
  }

  return '';
}

function getResourceObject(activity: ActivityStream, resourceKey: ResourceKey) {
  const { summary_fields } = activity;

  if (resourceKey && resourceKey in summary_fields) {
    const resourceArray = summary_fields[resourceKey];

    if (resourceArray && resourceArray.length > 0) {
      return resourceArray[0];
    }
  }

  return null;
}

const getOperationText = (operation: string) => {
  switch (operation) {
    case 'associate':
      return 'associated';
    case 'disassociate':
      return 'disassociated';
    case 'create':
      return 'created';
    case 'update':
      return 'updated';
    case 'delete':
      return 'deleted';
    default:
      return operation;
  }
};

export const ActivityDescription: React.FC<ActivityStreamDescriptionProps> = ({
  activity,
}: {
  activity: ActivityStream;
}) => {
  const getPageUrl = useGetPageUrl();
  const operationText = getOperationText(activity.operation);
  const sourceResourceRoute = useGetActivityStreamRoute(String(activity.object1));
  const targetResourceRoute = useGetActivityStreamRoute(String(activity.object2));
  const sourceResourceName = getResourceName(activity, activity.object1);
  const targetResourceName = getResourceName(activity, activity.object2);
  const targetResourceObj = getResourceObject(activity, activity.object2);
  const sourceResourceObj = getResourceObject(activity, activity.object1);
  const roleResource = getResourceObject(activity, 'role');
  const eventText = generateEventText(activity);

  function generateEventText(activity: ActivityStream): JSX.Element | string {
    const { operation, object1, object2 } = activity;
    const deletedResourceName = activity.changes?.name || null;
    switch (operation) {
      case 'create':
      case 'update':
      case 'delete': {
        if (sourceResourceRoute && sourceResourceObj) {
          // handle 'job' and 'workflow_job' and redirect to job output page
          switch (object1) {
            case 'job':
              return (
                <span>
                  {`${operationText} ${object1} `}
                  <Link
                    to={getPageUrl(sourceResourceRoute, {
                      params: { id: sourceResourceObj.id, job_type: 'playbook' },
                    })}
                    data-cy="source-resource-detail"
                  >
                    {sourceResourceName}
                  </Link>
                </span>
              );
            case 'workflow_job':
              return (
                <span>
                  {`${operationText} ${object1} `}
                  <Link
                    to={getPageUrl(sourceResourceRoute, {
                      params: { id: sourceResourceObj.id, job_type: 'workflow' },
                    })}
                    data-cy="source-resource-detail"
                  >
                    {sourceResourceName}
                  </Link>
                </span>
              );
          }
          return (
            <span>
              {`${operationText} ${object1} `}
              <Link
                to={getPageUrl(sourceResourceRoute, { params: { id: sourceResourceObj.id } })}
                data-cy="source-resource-detail"
              >
                {sourceResourceName}
              </Link>
            </span>
          );
        }
        return `${operationText} ${object1} ${sourceResourceName}${
          deletedResourceName && deletedResourceName !== sourceResourceName
            ? ` ${deletedResourceName}`
            : ''
        }`;
      }
      case 'disassociate': {
        if (targetResourceRoute && sourceResourceRoute && sourceResourceObj) {
          return (
            <span>
              {`${operationText} ${object1} `}
              {sourceResourceRoute && (
                <Link
                  to={getPageUrl(sourceResourceRoute, {
                    params: { id: sourceResourceObj.id },
                  })}
                  data-cy="source-resource-detail"
                >
                  {sourceResourceName}
                </Link>
              )}
              {roleResource && ` ${roleResource.role_field} `}
              {!sourceResourceRoute && <span>{sourceResourceName}</span>}
              {` from ${object2} `}
              {targetResourceRoute && targetResourceObj && (
                <Link
                  to={getPageUrl(targetResourceRoute, {
                    params: {
                      id: targetResourceObj.id,
                    },
                  })}
                  data-cy="target-resource-detail"
                >
                  {targetResourceName}
                </Link>
              )}
              {!targetResourceRoute && <span>{targetResourceName}</span>}
            </span>
          );
        }
        return (
          <span>
            {`${operationText} ${object1} ${sourceResourceName}`}
            {roleResource && `${roleResource.role_field}`} {`from ${object2} ${targetResourceName}`}
          </span>
        );
      }
      case 'associate': {
        if (targetResourceRoute && sourceResourceRoute && sourceResourceObj) {
          return (
            <span>
              {`${operationText} ${object1} `}
              {sourceResourceRoute && (
                <Link
                  to={getPageUrl(sourceResourceRoute, {
                    params: { id: sourceResourceObj.id },
                  })}
                  data-cy="source-resource-detail"
                >
                  {sourceResourceName}
                </Link>
              )}
              {roleResource && ` ${roleResource.role_field} `}
              {!sourceResourceRoute && <span>{sourceResourceName}</span>}
              {` to ${object2} `}
              {targetResourceRoute && targetResourceObj && (
                <Link
                  to={getPageUrl(targetResourceRoute, {
                    params: {
                      id: targetResourceObj.id,
                    },
                  })}
                  data-cy="target-resource-detail"
                >
                  {targetResourceName}
                </Link>
              )}
              {!targetResourceRoute && <span>{targetResourceName}</span>}
            </span>
          );
        }
        return (
          <span>
            {`${operationText} ${object1} ${sourceResourceName}`}
            {roleResource && `${roleResource.role_field}`} {`to ${object2} ${targetResourceName}`}
          </span>
        );
      }
      default: {
        // Default case if no specific event text is matched
        return `Event summary not available`;
      }
    }
  }

  return <span>{eventText}</span>;
};
