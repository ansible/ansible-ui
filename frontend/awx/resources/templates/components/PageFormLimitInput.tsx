import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Spinner,
  Tab,
  Tabs,
  TabTitleText,
  Tooltip,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { FieldPath, FieldValues, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ITableColumn, usePageDialog } from '@ansible/ansible-ui-framework';
import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '@ansible/common-ui/columns';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { AwxHost } from '../../../interfaces/AwxHost';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useGroupsFilters } from '../../groups/hooks/useGroupsFilters';
import {
  applyLimitSelection,
  getSimpleLimitNames,
  hasAdvancedLimitPatterns,
  uniqueNames,
} from './limitField';

const NAME_LOOKUP_PAGE_SIZE = 50;
const FIELD_LOOKUP_DEBOUNCE_MS = 300;

export type LimitName = { name: string };

export async function fetchInventoryResourcesByNames(
  inventoryId: number | string,
  names: string[],
  signal?: AbortSignal
): Promise<{ hosts: AwxHost[]; groups: InventoryGroup[] }> {
  const wantedNames = uniqueNames(names);
  if (wantedNames.length === 0) {
    return { hosts: [], groups: [] };
  }

  const wanted = new Set(wantedNames);
  const hosts: AwxHost[] = [];
  const groups: InventoryGroup[] = [];

  for (let index = 0; index < wantedNames.length; index += NAME_LOOKUP_PAGE_SIZE) {
    const chunk = wantedNames.slice(index, index + NAME_LOOKUP_PAGE_SIZE);
    const nameIn = chunk.join(',');
    const [hostPage, groupPage] = await Promise.all([
      requestGet<AwxItemsResponse<AwxHost>>(
        awxAPI`/inventories/${inventoryId}/hosts/?name__in=${nameIn}&page_size=${chunk.length}`,
        signal
      ),
      requestGet<AwxItemsResponse<InventoryGroup>>(
        awxAPI`/inventories/${inventoryId}/groups/?name__in=${nameIn}&page_size=${chunk.length}`,
        signal
      ),
    ]);
    hosts.push(...hostPage.results.filter((host) => wanted.has(host.name)));
    groups.push(...groupPage.results.filter((group) => wanted.has(group.name)));
  }

  return { hosts, groups };
}

type LimitNameLookupState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  unmatchedNames: string[];
  error: Error | null;
};

function useLimitNameLookup(
  inventoryId: number | string | null | undefined,
  limit: string | undefined | null,
  debounceMs = 0
): LimitNameLookupState {
  const { t } = useTranslation();
  const [state, setState] = useState<LimitNameLookupState>({
    status: 'idle',
    unmatchedNames: [],
    error: null,
  });

  useEffect(() => {
    const simpleNames = getSimpleLimitNames(limit);
    if (!inventoryId || simpleNames.length === 0) {
      setState({ status: 'idle', unmatchedNames: [], error: null });
      return;
    }

    const abortController = new AbortController();
    setState({ status: 'loading', unmatchedNames: [], error: null });

    const timer = setTimeout(() => {
      void fetchInventoryResourcesByNames(inventoryId, simpleNames, abortController.signal)
        .then((result) => {
          if (abortController.signal.aborted) return;
          const matched = new Set([
            ...result.hosts.map((host) => host.name),
            ...result.groups.map((group) => group.name),
          ]);
          setState({
            status: 'ready',
            unmatchedNames: simpleNames.filter((name) => !matched.has(name)),
            error: null,
          });
        })
        .catch((error: unknown) => {
          if (abortController.signal.aborted) return;
          setState({
            status: 'error',
            unmatchedNames: [],
            error: error instanceof Error ? error : new Error(t('Error loading hosts')),
          });
        });
    }, debounceMs);

    return () => {
      abortController.abort();
      clearTimeout(timer);
    };
  }, [inventoryId, limit, debounceMs, t]);

  return state;
}

export function PageFormLimitInput<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  id?: string;
  name: TFieldName;
  /** The inventory the Limit field applies to. Host and group browsing is disabled until an inventory is selected. */
  inventoryId?: number | string | null;
  label: string;
  labelHelpTitle?: string;
  labelHelp?: string | ReactNode;
  placeholder?: string;
  additionalControls?: ReactNode;
}) {
  const { t } = useTranslation();
  const { inventoryId, name, ...textInputProps } = props;
  const { setValue, getValues } = useFormContext<TFieldValues>();
  const limitValue = useWatch<TFieldValues, TFieldName>({ name });
  const lookup = useLimitNameLookup(
    inventoryId,
    typeof limitValue === 'string' ? limitValue : '',
    FIELD_LOOKUP_DEBOUNCE_MS
  );
  const [, setDialog] = usePageDialog();

  const openInventoryBrowser = useCallback(() => {
    if (!inventoryId) return;
    const currentLimit = (getValues(name) as string | undefined | null) ?? '';
    setDialog(
      <LimitHostsGroupsSelectDialog
        inventoryId={inventoryId}
        currentLimit={currentLimit}
        onApply={(nextLimit) => {
          setValue(name, nextLimit as PathValue<TFieldValues, TFieldName>, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
    );
  }, [inventoryId, name, getValues, setValue, setDialog]);

  const fieldHelper =
    lookup.status === 'error' && lookup.error ? (
      <span
        data-cy="limit-lookup-error"
        data-testid="limit-lookup-error"
        style={{ overflowWrap: 'anywhere' }}
      >
        {t('Unable to check Limit names against this inventory: {{message}}', {
          message: lookup.error.message,
        })}
      </span>
    ) : lookup.status === 'ready' && lookup.unmatchedNames.length > 0 ? (
      <span
        data-cy="limit-unmatched-field-helper"
        data-testid="limit-unmatched-field-helper"
        style={{ overflowWrap: 'anywhere' }}
      >
        {t('Names not found in this inventory: {{names}}.', {
          names: lookup.unmatchedNames.join(', '),
        })}
      </span>
    ) : undefined;

  return (
    <PageFormTextInput<TFieldValues, TFieldName>
      {...textInputProps}
      name={name}
      helperText={fieldHelper}
      helperTextVariant={lookup.status === 'error' ? 'error' : fieldHelper ? 'warning' : undefined}
      button={
        <Tooltip
          content={
            inventoryId
              ? t('Search and select hosts and groups from the inventory')
              : t('Select an inventory to search and select its hosts and groups')
          }
        >
          <Button
            data-cy="limit-host-browse-button"
            aria-label={t('Browse hosts and groups')}
            variant="control"
            icon={<SearchIcon />}
            isDisabled={!inventoryId}
            onClick={openInventoryBrowser}
          />
        </Tooltip>
      }
    />
  );
}

export function LimitHostsGroupsSelectDialog(props: {
  inventoryId: number | string;
  currentLimit?: string | null;
  onApply: (nextLimit: string) => void;
}) {
  const { t } = useTranslation();
  const { inventoryId, onApply } = props;
  const currentLimit = props.currentLimit ?? '';
  const simpleNames = useMemo(() => getSimpleLimitNames(currentLimit), [currentLimit]);
  const [matchedHosts, setMatchedHosts] = useState<AwxHost[]>([]);
  const [matchedGroups, setMatchedGroups] = useState<InventoryGroup[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(simpleNames.length > 0);
  const [loadError, setLoadError] = useState<Error>();
  const [, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);

  useEffect(() => {
    if (simpleNames.length === 0) {
      setMatchedHosts([]);
      setMatchedGroups([]);
      setIsLoadingMatches(false);
      setLoadError(undefined);
      return;
    }

    const abortController = new AbortController();
    setIsLoadingMatches(true);
    setLoadError(undefined);

    void fetchInventoryResourcesByNames(inventoryId, simpleNames, abortController.signal)
      .then((result) => {
        if (abortController.signal.aborted) return;
        setMatchedHosts(result.hosts);
        setMatchedGroups(result.groups);
        setIsLoadingMatches(false);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) return;
        setMatchedHosts([]);
        setMatchedGroups([]);
        setIsLoadingMatches(false);
        setLoadError(error instanceof Error ? error : new Error(t('Error loading hosts')));
      });

    return () => abortController.abort();
  }, [inventoryId, simpleNames, t]);

  if (isLoadingMatches) {
    return (
      <Modal
        ouiaId="Select hosts and groups"
        isOpen
        onClose={onClose}
        variant={ModalVariant.medium}
        aria-label={t('Select hosts and groups')}
      >
        <ModalHeader title={t('Select hosts and groups')} />
        <ModalBody>
          <Spinner aria-label={t('Loading matching hosts and groups')} />
        </ModalBody>
        <ModalFooter>
          <Button id="cancel" variant="link" onClick={onClose}>
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <LimitPickerLoaded
      key={String(inventoryId)}
      inventoryId={inventoryId}
      currentLimit={currentLimit}
      defaultHosts={loadError ? [] : matchedHosts}
      defaultGroups={loadError ? [] : matchedGroups}
      lookupError={loadError}
      onApply={onApply}
      onClose={onClose}
    />
  );
}

function LimitPickerLoaded(props: {
  inventoryId: number | string;
  currentLimit: string;
  defaultHosts: AwxHost[];
  defaultGroups: InventoryGroup[];
  lookupError?: Error;
  onApply: (nextLimit: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { inventoryId, currentLimit, defaultHosts, defaultGroups, lookupError, onApply, onClose } =
    props;
  const [activeTab, setActiveTab] = useState<'hosts' | 'groups'>('hosts');
  const [removedUnmatched, setRemovedUnmatched] = useState<string[]>([]);

  const nameColumn = useNameColumn({ disableLinks: true });
  const createdColumn = useCreatedColumn();
  const modifiedColumn = useModifiedColumn();
  const hostColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
  const groupColumns = useMemo<ITableColumn<InventoryGroup>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );

  const hostFilters = useGroupsFilters({ url: `inventories/${inventoryId}/hosts` });
  const groupFilters = useGroupsFilters({ url: `inventories/${inventoryId}/groups` });

  const hostView = useAwxView<AwxHost>({
    url: awxAPI`/inventories/${inventoryId}/hosts/`,
    toolbarFilters: hostFilters,
    tableColumns: hostColumns,
    disableQueryString: true,
    defaultSelection: defaultHosts,
  });
  const groupView = useAwxView<InventoryGroup>({
    url: awxAPI`/inventories/${inventoryId}/groups/`,
    toolbarFilters: groupFilters,
    tableColumns: groupColumns,
    disableQueryString: true,
    defaultSelection: defaultGroups,
  });

  const matchedNames = useMemo(
    () =>
      uniqueNames([
        ...defaultHosts.map((host) => host.name),
        ...defaultGroups.map((group) => group.name),
      ]),
    [defaultHosts, defaultGroups]
  );
  const unmatchedNames = useMemo(() => {
    if (lookupError) return [];
    const matched = new Set(matchedNames);
    const removed = new Set(removedUnmatched);
    return getSimpleLimitNames(currentLimit).filter(
      (name) => !matched.has(name) && !removed.has(name)
    );
  }, [currentLimit, matchedNames, removedUnmatched, lookupError]);
  const showAdvancedHelp = hasAdvancedLimitPatterns(currentLimit);
  const hasExistingLimit = currentLimit.trim().length > 0;
  const selectedNames = uniqueNames([
    ...hostView.selectedItems.map((host) => host.name),
    ...groupView.selectedItems.map((group) => group.name),
  ]);
  const nextLimit = applyLimitSelection(
    currentLimit,
    selectedNames,
    matchedNames,
    removedUnmatched
  );
  const willClearLimit = currentLimit.trim().length > 0 && nextLimit.trim().length === 0;

  return (
    <Modal
      ouiaId="Select hosts and groups"
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      tabIndex={0}
      aria-label={t('Select hosts and groups')}
    >
      <ModalHeader
        title={t('Select hosts and groups')}
        description={t(
          'Select explicit hosts and groups from this inventory. Searching and paging keep your checkboxes. Wildcards, exclusions, ranges, regular expressions, and IPv6 addresses stay in the Limit field as typed.'
        )}
      />
      <ModalBody>
        {lookupError && (
          <Alert
            isInline
            variant="danger"
            title={t('Unable to check Limit names against this inventory')}
            data-cy="limit-picker-lookup-error"
            data-testid="limit-picker-lookup-error"
            style={{ marginBottom: '1rem' }}
          >
            {lookupError.message}
          </Alert>
        )}
        {showAdvancedHelp && (
          <Alert
            isInline
            variant="info"
            title={t('Some Limit patterns cannot be edited with checkboxes')}
            style={{ marginBottom: '1rem' }}
          >
            {t(
              'The picker only checks exact host and group names. Advanced Ansible patterns stay in Limit unless you edit the text field.'
            )}
          </Alert>
        )}
        {unmatchedNames.length > 0 && (
          <div
            data-cy="limit-unmatched-section"
            data-testid="limit-unmatched-section"
            style={{ marginBottom: '1rem' }}
          >
            <Alert
              isInline
              variant="warning"
              title={t('Names still in Limit but not found in this inventory')}
            >
              <p>
                {t(
                  'These names are not in the selected inventory. Removing a name here only changes Limit. It does not delete hosts or groups from the inventory.'
                )}
              </p>
              <Flex
                spaceItems={{ default: 'spaceItemsSm' }}
                alignItems={{ default: 'alignItemsCenter' }}
                style={{ marginTop: '0.75rem' }}
              >
                <FlexItem>
                  <LabelGroup>
                    {unmatchedNames.map((name) => (
                      <Label
                        key={name}
                        onClose={() =>
                          setRemovedUnmatched((current) => uniqueNames([...current, name]))
                        }
                        closeBtnAriaLabel={t('Remove {{name}} from Limit', { name })}
                      >
                        {name}
                      </Label>
                    ))}
                  </LabelGroup>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="link"
                    isInline
                    data-cy="limit-unmatched-remove-all"
                    data-testid="limit-unmatched-remove-all"
                    aria-label={t('Remove all unmatched names from Limit')}
                    onClick={() =>
                      setRemovedUnmatched((current) => uniqueNames([...current, ...unmatchedNames]))
                    }
                  >
                    {t('Remove all unmatched')}
                  </Button>
                </FlexItem>
              </Flex>
            </Alert>
          </div>
        )}
        <div
          data-cy="limit-all-selected"
          data-testid="limit-all-selected"
          style={{ marginBottom: '0.75rem' }}
        >
          <strong>{t('Selected hosts and groups')}</strong>
          {': '}
          <span data-cy="limit-all-selected-names" data-testid="limit-all-selected-names">
            {selectedNames.length > 0 ? selectedNames.join(', ') : t('None')}
          </span>
        </div>
        <Tabs
          aria-label={t('Inventory resources')}
          activeKey={activeTab}
          onSelect={(_event, tab) => setActiveTab(tab as 'hosts' | 'groups')}
          ouiaId="limit-inventory-tabs"
        >
          <Tab
            eventKey="hosts"
            title={<TabTitleText>{t('Hosts')}</TabTitleText>}
            aria-label={t('Hosts')}
          >
            <div data-cy="limit-hosts-tab" data-testid="limit-hosts-tab">
              <PageMultiSelectList<AwxHost>
                view={hostView}
                tableColumns={hostColumns}
                toolbarFilters={hostFilters}
                emptyStateTitle={t('No hosts found')}
                errorStateTitle={t('Error loading hosts')}
                labelForSelectedItems={t('Selected hosts')}
                isCompact
              />
            </div>
          </Tab>
          <Tab
            eventKey="groups"
            title={<TabTitleText>{t('Groups')}</TabTitleText>}
            aria-label={t('Groups')}
          >
            <div data-cy="limit-groups-tab" data-testid="limit-groups-tab">
              <PageMultiSelectList<InventoryGroup>
                view={groupView}
                tableColumns={groupColumns}
                toolbarFilters={groupFilters}
                emptyStateTitle={t('No groups found')}
                errorStateTitle={t('Error loading groups')}
                labelForSelectedItems={t('Selected groups')}
                isCompact
              />
            </div>
          </Tab>
        </Tabs>
        <div data-cy="limit-preview" data-testid="limit-preview" style={{ marginTop: '1rem' }}>
          <strong>{t('Limit after apply')}</strong>
          {': '}
          <span data-cy="limit-preview-value" data-testid="limit-preview-value">
            {nextLimit.length > 0 ? nextLimit : t('(empty)')}
          </span>
        </div>
        {willClearLimit && (
          <Alert
            isInline
            variant="info"
            title={t('An empty Limit adds no extra host restriction')}
            data-cy="limit-empty-help"
            data-testid="limit-empty-help"
            style={{ marginTop: '0.75rem' }}
          >
            {t(
              'An empty Limit adds no extra host restriction. When launched, the job can run on the hosts targeted by the playbook in the selected inventory.'
            )}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          key="submit"
          variant="primary"
          id="submit"
          onClick={() => {
            onClose();
            onApply(nextLimit);
          }}
        >
          {hasExistingLimit ? t('Apply selection') : t('Add to limit')}
        </Button>
        <Button id="cancel" key="cancel" variant="link" onClick={onClose}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
