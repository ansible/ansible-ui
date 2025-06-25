import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { Button } from '@patternfly/react-core';
import { HistoryIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router';
import { AwxRoute } from '../main/AwxRoutes';

interface ActivityStreamIconProps {
  type: string;
}
export const ActivityStreamIcon: React.FC<ActivityStreamIconProps> = ({
  type,
}: {
  type: string;
}) => {
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
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
        void navigate(
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
