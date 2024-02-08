import { Button } from '@patternfly/react-core';
import { useGetPageUrl } from '../../../framework';
import { useNavigate } from 'react-router-dom';
import { AwxRoute } from '../main/AwxRoutes';
import { HistoryIcon } from '@patternfly/react-icons';

interface ActivityStreamIconProps {
  type: string;
}
export const ActivityStreamIcon: React.FC<ActivityStreamIconProps> = ({
  type,
}: {
  type: string;
}) => {
  const getPageUrl = useGetPageUrl();
  const history = useNavigate();
  return (
    <Button
      variant="link"
      style={{
        padding: 0,
        marginTop: 1,
        marginLeft: 8,
        verticalAlign: 'top',
      }}
      onClick={() =>
        history(
          getPageUrl(AwxRoute.ActivityStream, {
            query: {
              type: type,
            },
          })
        )
      }
    >
      <HistoryIcon />
    </Button>
  );
};
