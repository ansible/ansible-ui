import {
  Button,
  ToggleGroup,
  ToggleGroupItem,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { ColumnsIcon, ListIcon, TableIcon, ThLargeIcon } from '@patternfly/react-icons';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { PageTableViewType, PageTableViewTypeE } from './PageTableViewType';

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
    <ToolbarGroup variant="button-group" style={{ justifyContent: 'end', marginRight: 0 }}>
      {openColumnModal && (
        <ToolbarItem>
          <Tooltip content={translations.manageColumns}>
            <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
          </Tooltip>
        </ToolbarItem>
      )}
      {viewTypeCount > 1 && (
        <ToolbarItem>
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
                      <Tooltip
                        content={translations.cardView}
                        key={vt}
                        position="top-end"
                        enableFlip={false}
                      >
                        <ToggleGroupItem
                          icon={<ThLargeIcon />}
                          isSelected={viewType === PageTableViewTypeE.Cards}
                          onClick={() => setViewType?.(PageTableViewTypeE.Cards)}
                          aria-label="card view"
                          data-cy={'card-view'}
                        />
                      </Tooltip>
                    );
                  case PageTableViewTypeE.List:
                    return (
                      <Tooltip
                        content={translations.listView}
                        key={vt}
                        position="top-end"
                        enableFlip={false}
                      >
                        <ToggleGroupItem
                          icon={<ListIcon />}
                          isSelected={viewType === PageTableViewTypeE.List}
                          onClick={() => setViewType?.(PageTableViewTypeE.List)}
                          aria-label="list view"
                          data-cy={'list-view'}
                        />
                      </Tooltip>
                    );
                  case PageTableViewTypeE.Table:
                    return (
                      <Tooltip
                        content={translations.tableView}
                        key={vt}
                        position="top-end"
                        enableFlip={false}
                      >
                        <ToggleGroupItem
                          icon={<TableIcon />}
                          isSelected={viewType === PageTableViewTypeE.Table}
                          onClick={() => setViewType?.(PageTableViewTypeE.Table)}
                          aria-label="table view"
                          data-cy={'table-view'}
                        />
                      </Tooltip>
                    );
                }
              })}
          </ToggleGroup>
        </ToolbarItem>
      )}
    </ToolbarGroup>
  );
}
