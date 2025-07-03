import { usePageDialog } from '@ansible/ansible-ui-framework';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import {
  Alert,
  AlertProps,
  Button,
  InputGroup,
  LabelGroup,
  Stack,
  TextInput,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
} from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '../../../administration/tasks/Task';
import { HubError } from '../../../common/HubError';
import { hubAPI } from '../../../common/api/formatPath';
import { hubAPIPost } from '../../../common/api/hub-api-utils';
import { HubItemsResponse } from '../../../common/useHubView';
import { ExecutionEnvironment } from '../../ExecutionEnvironment';
import { ExecutionEnvironmentTag } from '../../ExecutionEnvironmentTag';
import { ExecutionEnvironmentImage } from '../ExecutionEnvironmentImage';
import { TagLabel } from '../components/ImageLabels';

const VALID_TAG_REGEX = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function useExecutionEnvironmentManageTags(onComplete?: () => void) {
  const [_, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);

  return (ee: ExecutionEnvironment, image: ExecutionEnvironmentImage) => {
    setDialog(<ManageTagsModal ee={ee} image={image} onClose={onClose} onComplete={onComplete} />);
  };
}

function ManageTagsModal(props: {
  ee: ExecutionEnvironment;
  image: ExecutionEnvironmentImage;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const { ee, image, onClose, onComplete } = props;
  const { t } = useTranslation();
  const [tag, setTag] = useState<string>('');
  const [tagFormError, setTagFormError] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertProps>();

  const setTimedAlert = (alert: AlertProps, timeout = 5000) => {
    setAlert(alert);
    setTimeout(() => {
      setAlert(undefined);
    }, timeout);
  };

  const { data, isLoading, error, refresh } = useGet<HubItemsResponse<ExecutionEnvironmentTag>>(
    hubAPI`/v3/plugin/execution-environments/repositories/${ee.name}/_content/tags/`,
    {
      sort: '-created_at',
      tagged_manifest__digest: image.digest,
    }
  );

  const repoId = ee?.pulp?.repository?.id;
  const tags = data?.data;

  const addTag = async () => {
    setIsUpdating(true);
    let alert: AlertProps;

    if (!validateTag(tag)) {
      setTagFormError(
        t`A tag may contain lowercase and uppercase ASCII alphabetic characters, digits, underscores, periods, and dashes. A tag must not start with a period, underscore, or a dash.`
      );
    } else {
      try {
        // tag already exists, do not add it
        await requestGet(
          hubAPI`/v3/plugin/execution-environments/repositories/${ee.name ?? ''}/_content/images/${
            tag ?? ''
          }/`
        );
      } catch (error) {
        // tag doesn't exist, we can continue
        setTagFormError('');

        try {
          const addTagPost = await hubAPIPost(
            hubAPI`/pulp/api/v3/repositories/container/container-push/${repoId ?? ''}/tag/`,
            {
              tag,
              digest: image.digest,
            }
          );

          if ((addTagPost as Task).state === 'completed') {
            alert = {
              variant: 'success',
              title: t(`Tag {{tag}} successfully added.`, { tag }),
            };
          } else {
            alert = {
              variant: 'danger',
              title: t(`Failed to add tag {{tag}}.`, { tag }),
            };
          }
          refresh();
          onComplete?.();
          setTimedAlert(alert);
          setTag('');
        } catch (error) {
          setTagFormError((error as { details: string })?.details || t`Error while adding tag`);
        }
      }
    }
    setIsUpdating(false);
  };

  const removeTag = async (tag: string) => {
    setIsUpdating(true);

    try {
      const removeTagPost = await hubAPIPost(
        hubAPI`/pulp/api/v3/repositories/container/container-push/${repoId ?? ''}/untag/`,
        {
          tag,
        }
      );

      if ((removeTagPost as Task).state === 'completed') {
        setTimedAlert({
          variant: 'success',
          title: t(`Tag {{tag}} successfully removed.`, { tag }),
        });
      } else {
        setTimedAlert({
          variant: 'danger',
          title: t(`Failed to remove tag {{tag}}.`, { tag }),
        });
      }

      refresh();
    } catch (error) {
      setTagFormError((error as { details: string })?.details || t`Error while removing tag`);
    }
    setIsUpdating(false);
  };

  const validateTag = (tag: string) => tag.match(VALID_TAG_REGEX);

  return (
    <Modal
      aria-label={t(`Manage tags`)}
      isOpen
      onClose={() => {
        onClose();
      }}
      variant={ModalVariant.medium}
      tabIndex={0}
    >
      <ModalHeader title={t(`Manage tags`)} />
      <ModalBody style={{ overflow: 'hidden' }}>
        {error ? (
          <HubError error={error} handleRefresh={refresh} />
        ) : (
          <Stack hasGutter>
            {alert && <Alert variant={alert.variant} isInline title={alert.title} />}
            <PageFormGroup label={t(`Add new tag`)} helperTextInvalid={tagFormError}>
              <InputGroup>
                <TextInput
                  validated={tagFormError ? 'error' : 'default'}
                  type="text"
                  id="add-tag-input"
                  data-cy="add-tag-input"
                  value={tag}
                  onChange={(val) => {
                    setTag(val?.currentTarget?.value || '');
                  }}
                  onKeyUp={(e) => {
                    // l10n: don't translate
                    if (e.key === 'Enter') {
                      void addTag();
                    }
                  }}
                  isDisabled={isLoading || isUpdating}
                />
                <Button
                  variant="secondary"
                  isDisabled={
                    isLoading || isUpdating || !tag || tags?.some((_tag) => _tag.name === tag)
                  }
                  onClick={() => {
                    void addTag();
                  }}
                >
                  {t`Add`}
                </Button>
              </InputGroup>
            </PageFormGroup>
            {isLoading || isUpdating || !tags ? (
              <LoadingState />
            ) : (
              <PageFormGroup fieldId="tag" label={t`Current tags`}>
                <LabelGroup id="tag" data-cy="tag" defaultIsOpen={true}>
                  {tags.map((tag) => (
                    <TagLabel
                      onClose={() => {
                        void removeTag(tag.name);
                      }}
                      key={tag.name}
                      tag={tag.name}
                    />
                  ))}
                </LabelGroup>
              </PageFormGroup>
            )}
          </Stack>
        )}
      </ModalBody>
    </Modal>
  );
}
