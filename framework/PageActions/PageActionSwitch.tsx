import { Switch, Tooltip } from '@patternfly/react-core';
import { ComponentClass, Fragment, FunctionComponent, useId } from 'react';
import { IPageActionSwitch, IPageActionSwitchSingle, PageActionSelection } from './PageAction';
import { usePageActionDisabled } from './PageActionUtils';

export function PageActionSwitch<T extends object>(props: {
  action: IPageActionSwitch | IPageActionSwitchSingle<T>;
  wrapper?: ComponentClass | FunctionComponent;
  selectedItem?: T;
  iconOnly?: boolean;
}) {
  const { action, wrapper, selectedItem, iconOnly } = props;

  const isPageActionDisabled = usePageActionDisabled<T>();
  const isDisabled = isPageActionDisabled(action, selectedItem);

  const Wrapper = wrapper ?? Fragment;
  const tooltip = isDisabled ? isDisabled : action.tooltip ? action.tooltip : undefined;
  const id = useId();

  let label: string | undefined = action.label;
  if (iconOnly && action.showPinnedLabel !== true) {
    label = undefined;
  }

  let labelOff: string | undefined = action.labelOff;
  if (iconOnly && action.showPinnedLabel !== true) {
    labelOff = undefined;
  }

  const isChecked = selectedItem ? action.isSwitchOn(selectedItem) : false;

  return (
    <Wrapper>
      <div
        style={{ marginLeft: iconOnly ? 16 : undefined, marginRight: iconOnly ? 16 : undefined }}
      >
        <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
          <Switch
            id={id}
            label={label}
            labelOff={labelOff}
            isChecked={isChecked}
            onChange={() => {
              switch (action.selection) {
                case PageActionSelection.None:
                  action.onToggle(!isChecked);
                  break;
                case PageActionSelection.Single:
                  if (selectedItem) {
                    void action.onToggle(selectedItem, !isChecked);
                  }
                  break;
              }
            }}
            isReversed={iconOnly}
          />
        </Tooltip>
      </div>
    </Wrapper>
  );
}
