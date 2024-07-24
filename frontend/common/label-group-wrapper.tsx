import { LabelGroup as PFLabelGroup } from '@patternfly/react-core';

type LabelGroupWrapperState = {
  headingRef: { current: { offsetWidth: number; scrollWidth: number } };
};

// fix button without type when rendering "show more" in forms
export class LabelGroupWrapper extends PFLabelGroup {
  // @ts-expect-error Type '(e: React.MouseEvent<HTMLButtonElement>) => void' is not assignable to type '() => void'.
  toggleCollapse = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Label isOverflowLabel renders a button, but not button type=button, breaks forms
    event.preventDefault();

    // original LabelGroup toggleCollapse, as of @patternfly/react-core 5.2.0, w/ ts fix
    this.setState((prevState) => {
      const obj = this as unknown as LabelGroupWrapperState;
      const currentRef = obj.headingRef.current;

      return {
        isOpen: !prevState.isOpen,
        isTooltipVisible: Boolean(currentRef && currentRef.offsetWidth < currentRef.scrollWidth),
      };
    });
  };
}
