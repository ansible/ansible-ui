import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  DropdownPosition,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { PageDetailsSection } from '../../common/PageDetailSection';
import { API_PREFIX } from '../../constants';
import { EdaInventory } from '../../interfaces/EdaInventory';
import { useDeleteInventories } from './hooks/useDeleteInventories';

export function InventoryDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: inventory } = useGet<EdaInventory>(`${API_PREFIX}/inventory/${params.id ?? ''}/`);
  const [copied, setCopied] = React.useState(false);

  const clipboardCopyFunc = (event: React.MouseEvent, text: { toString: () => string }) => {
    void navigator.clipboard.writeText(text.toString());
  };

  const onClick = (event: React.MouseEvent, text: { toString: () => string }) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const deleteInventories = useDeleteInventories((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaInventories);
    }
  });
  const itemActions = useMemo<IPageAction<EdaInventory>[]>(
    () => [
      {
        type: PageActionType.Single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        onClick: (inventory: EdaInventory) => deleteInventories([inventory]),
        isDanger: true,
      },
    ],
    [deleteInventories, t]
  );
  const actions = (
    <React.Fragment>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="basic-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, inventory?.inventory || '')}
          exitDelay={copied ? 1500 : 600}
          maxWidth="110px"
          variant="plain"
          onTooltipHidden={() => setCopied(false)}
        >
          {copied ? t('Successfully copied to clipboard!') : t('Copy to clipboard')}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </React.Fragment>
  );

  const renderInventoryDetailsTab = (inventory: EdaInventory | undefined): JSX.Element => {
    return (
      <React.Fragment>
        <PageDetails>
          <PageDetail label={t('Name')}>{inventory?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{inventory?.description || ''}</PageDetail>
          <PageDetail label={t('Source of Inventory')}>
            {inventory?.inventory_source || ''}
          </PageDetail>
          <PageDetail label={t('Created')}>
            {inventory?.created_at ? formatDateString(inventory.created_at) : ''}
          </PageDetail>
          <PageDetail label={t('Modified')}>
            {inventory?.modified_at ? formatDateString(inventory.modified_at) : ''}
          </PageDetail>
        </PageDetails>
        <PageDetailsSection>
          <PageDetail label={t('Inventory')}>
            <CodeBlock actions={actions}>
              <CodeBlockCode id="code-content">{inventory?.inventory || ''} </CodeBlockCode>
            </CodeBlock>
          </PageDetail>
        </PageDetailsSection>
      </React.Fragment>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={inventory?.name}
        breadcrumbs={[
          { label: t('Inventories'), to: RouteObj.EdaInventories },
          { label: inventory?.name },
        ]}
        headerActions={
          <PageActions<EdaInventory>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={inventory}
          />
        }
      />
      {inventory ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderInventoryDetailsTab(inventory)}</PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
