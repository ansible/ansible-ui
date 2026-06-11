import { Switch, Tooltip } from '@patternfly/react-core';
import { ComponentClass, Fragment, FunctionComponent, useId } from 'react';
import { IPageActionSwitch, IPageActionSwitchSingle, PageActionSelection } from './PageAction';
import { usePageActionDisabled } from './PageActionUtils';

function getTooltip<T extends object>(
  action: IPageActionSwitch | IPageActionSwitchSingle<T>,
  isDisabled: string | undefined,
  iconOnly: boolean,
  isChecked: boolean
): string | undefined {
  if (isDisabled) {
    return isDisabled;
  }

  if (action.tooltip) {
    return action.tooltip;
  }

  if (iconOnly) {
    return isChecked ? action.label : undefined;
  }

  return undefined;
}

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

  const isChecked = selectedItem && action.isSwitchOn ? action.isSwitchOn(selectedItem) : false;

  const tooltipContent = getTooltip<T>(action, isDisabled, iconOnly ?? false, isChecked);

  const id = useId();

  let label: string | undefined = action.label;
  if (iconOnly && action.showPinnedLabel !== true) {
    label = undefined;
  }

  return (
    <Wrapper>
      <div
        data-cy="toggle-switch"
        data-testid="toggle-switch"
        style={{ marginLeft: iconOnly ? 16 : undefined, marginRight: iconOnly ? 16 : undefined }}
      >
        <Tooltip content={tooltipContent} trigger={tooltipContent ? undefined : 'manual'}>
          <Switch
            id={id}
            aria-label={action.ariaLabel(isChecked)}
            label={label}
            isChecked={isChecked}
            hasCheckIcon={true}
            isDisabled={isDisabled ? true : false}
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
            isReversed={action?.isReversed !== undefined ? action.isReversed : iconOnly}
          />
        </Tooltip>
      </div>
    </Wrapper>
  );
}
