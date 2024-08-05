import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderImageIcon } from '@patternfly/react-icons';
import {
  IPageAction,
  PageActionType,
  PageActionSelection,
  usePageNavigate,
} from '../../../../framework';
import { AwxRoute } from '../../../awx/main/AwxRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { ExecutionEnvironmentImage as Image } from '../ExecutionEnvironmentPage/ExecutionEnvironmentImage';

// returns controller UI URL for the EE add form, prefilling a chosen image from hub
export function imageURL({
  image: name,
  tag,
  digest,
}: {
  image: string;
  tag?: string;
  digest?: string;
}) {
  if (!digest && !tag) {
    tag = 'latest';
  }

  const host = window.location.host;

  return `${host}/${name}${tag ? `:${tag}` : ''}${digest && !tag ? `@${digest}` : ''}`;
}

// FIXME: remove from upstream in favor of pluggable actions (AAP-26404)
export function useController(detailEE?: ExecutionEnvironment, isImage = false) {
  const { t } = useTranslation();
  const navigate = usePageNavigate();

  return useMemo<IPageAction<ExecutionEnvironment | Image>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      icon: BuilderImageIcon,
      label: t('Use in Controller'),
      onClick: (listItem?: ExecutionEnvironment | Image) => {
        const executionEnvironment = (
          isImage ? detailEE : listItem || detailEE
        ) as ExecutionEnvironment;
        const eeImage = isImage ? (listItem as Image) : null;

        const image = eeImage
          ? imageURL({
              image: executionEnvironment.name,
              digest: eeImage.digest,
              tag: eeImage.tags[0],
            })
          : imageURL({ image: executionEnvironment.name });

        navigate(AwxRoute.CreateExecutionEnvironment, {
          params: {
            image,
          },
        });
      },
    }),
    [t, detailEE, isImage, navigate]
  );
}
