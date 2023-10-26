import {
  Button,
  Split,
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupItemProps,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { CogIcon, ColumnsIcon, ListIcon, TableIcon, ThLargeIcon } from '@patternfly/react-icons';
import { useRef } from 'react';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { PageTableViewType, PageTableViewTypeE } from './PageTableViewType';
import { PageToolbarToggleGroup } from './PageToolbarToggleGroup';

export type PageToolbarViewProps = {
  disableTableView?: boolean;
  disableCardView?: boolean;
  disableListView?: boolean;
  openColumnModal?: () => void;
  viewType: PageTableViewType;
  setViewType: (viewType: PageTableViewType) => void;
};

export function PageToolbarView(props: PageToolbarViewProps) {
  const { viewType, setViewType, openColumnModal } = props;

  const [translations] = useFrameworkTranslations();

  let viewTypeCount = 0;
  if (!props.disableTableView) viewTypeCount++;
  if (!props.disableCardView) viewTypeCount++;
  if (!props.disableListView) viewTypeCount++;

  return (
    <PageToolbarToggleGroup breakpoint="md" toggleIcon={<CogIcon />}>
      <ToolbarGroup variant="button-group" style={{ justifyContent: 'end', marginRight: 0 }}>
        <ToolbarItem>
          <Split hasGutter>
            {openColumnModal && (
              <Tooltip content={translations.manageColumns}>
                <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
              </Tooltip>
            )}
            {viewTypeCount > 1 && (
              <ToggleGroup data-cy={'table-view-toggle'} aria-label="table view toggle">
                {[
                  !props.disableTableView && PageTableViewTypeE.Table,
                  !props.disableListView && PageTableViewTypeE.List,
                  !props.disableCardView && PageTableViewTypeE.Cards,
                ]
                  .filter((i) => i)
                  .map((vt) => {
                    switch (vt) {
                      case PageTableViewTypeE.Cards:
                        return (
                          <PageToggleGroupItem
                            icon={<ThLargeIcon />}
                            isSelected={viewType === PageTableViewTypeE.Cards}
                            onClick={() => setViewType?.(PageTableViewTypeE.Cards)}
                            aria-label="card view"
                            data-cy={'card-view'}
                            tooltip={translations.cardView}
                          />
                        );
                      case PageTableViewTypeE.List:
                        return (
                          <PageToggleGroupItem
                            icon={<ListIcon />}
                            isSelected={viewType === PageTableViewTypeE.List}
                            onClick={() => setViewType?.(PageTableViewTypeE.List)}
                            aria-label="list view"
                            data-cy={'list-view'}
                            tooltip={translations.listView}
                          />
                        );
                      case PageTableViewTypeE.Table:
                        return (
                          <PageToggleGroupItem
                            icon={<TableIcon />}
                            isSelected={viewType === PageTableViewTypeE.Table}
                            onClick={() => setViewType?.(PageTableViewTypeE.Table)}
                            aria-label="table view"
                            data-cy={'table-view'}
                            tooltip={translations.tableView}
                          />
                        );
                    }
                  })}
              </ToggleGroup>
            )}
          </Split>
        </ToolbarItem>
      </ToolbarGroup>
    </PageToolbarToggleGroup>
  );
}

function PageToggleGroupItem(
  props: ToggleGroupItemProps & {
    tooltip: string;
  }
) {
  const { tooltip, ...rest } = props;
  return (
    <Tooltip
      content={tooltip}
      position="top-end"
      enableFlip={false}
      triggerRef={useRef<HTMLDivElement>(null)}
    >
      <ToggleGroupItem ref={useRef<HTMLDivElement>(null)} {...rest} />
    </Tooltip>
  );
}
