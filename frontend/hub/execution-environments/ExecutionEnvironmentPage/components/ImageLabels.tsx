import { Link } from 'react-router-dom';
import { Tooltip, Label } from '@patternfly/react-core';
import TagIcon from '@patternfly/react-icons/dist/esm/icons/tag-icon';
import { truncateSha } from '../../../common/utils/truncateSha';
import { useGetPageUrl } from '../../../../../framework';
import { HubRoute } from '../../../main/HubRoutes';

export const ShaLabel = ({
  digest,
  grey,
  long,
}: {
  digest: string;
  grey?: boolean;
  long?: boolean;
}) => (
  <Tooltip content={digest}>
    <Label color={grey ? 'grey' : 'blue'}>{long ? digest : truncateSha(digest)}</Label>
  </Tooltip>
);

export const TagLabel = ({ tag, onClose }: { tag: string; onClose?: () => void }) => (
  <Label variant="outline" icon={<TagIcon />} onClose={onClose}>
    {tag}
  </Label>
);

export const ShaLink = ({ id, digest }: { id: string; digest: string }) => {
  const getPageUrl = useGetPageUrl();

  return (
    <Link
      to={getPageUrl(HubRoute.ExecutionEnvironmentImageDetails, { params: { id, tag: digest } })}
    >
      <ShaLabel digest={digest} />
    </Link>
  );
};

export const TagLink = ({ id, tag }: { id: string; tag: string }) => {
  const getPageUrl = useGetPageUrl();

  return (
    <Link to={getPageUrl(HubRoute.ExecutionEnvironmentImageDetails, { params: { id, tag } })}>
      <TagLabel tag={tag} />
    </Link>
  );
};
