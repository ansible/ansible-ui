import {
  Button,
  ToggleGroup,
  ToggleGroupItem,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { ColumnsIcon, ListIcon, TableIcon, ThLargeIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
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

  const { t } = useTranslation();
  let viewTypeCount = 0;
  if (!props.disableTableView) viewTypeCount++;
  if (!props.disableCardView) viewTypeCount++;
  if (!props.disableListView) viewTypeCount++;

  return (
    <ToolbarGroup variant="button-group" style={{ justifyContent: 'end', marginRight: 0 }}>
      {openColumnModal && (
        <ToolbarItem>
          <Tooltip content={t('Manage columns')}>
            <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
          </Tooltip>
        </ToolbarItem>
      )}
      {viewTypeCount > 1 && (
        <ToolbarItem>
          <ToggleGroup aria-label="table view toggle">
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
                        content={t('Card view')}
                        key={vt}
                        position="top-end"
                        enableFlip={false}
                      >
                        <ToggleGroupItem
                          icon={<ThLargeIcon />}
                          isSelected={viewType === PageTableViewTypeE.Cards}
                          onClick={() => setViewType?.(PageTableViewTypeE.Cards)}
                          aria-label="card view"
                        />
                      </Tooltip>
                    );
                  case PageTableViewTypeE.List:
                    return (
                      <Tooltip
                        content={t('List view')}
                        key={vt}
                        position="top-end"
                        enableFlip={false}
                      >
                        <ToggleGroupItem
                          icon={<ListIcon />}
                          isSelected={viewType === PageTableViewTypeE.List}
                          onClick={() => setViewType?.(PageTableViewTypeE.List)}
                          aria-label="list view"
                        />
                      </Tooltip>
                    );
                  case PageTableViewTypeE.Table:
                    return (
                      <Tooltip
                        content={t('Table view')}
                        key={vt}
                        position="top-end"
                        enableFlip={false}
                      >
                        <ToggleGroupItem
                          icon={<TableIcon />}
                          isSelected={viewType === PageTableViewTypeE.Table}
                          onClick={() => setViewType?.(PageTableViewTypeE.Table)}
                          aria-label="table view"
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
