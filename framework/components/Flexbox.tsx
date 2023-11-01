import { ReactNode, useMemo } from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type Display = 'flex' | 'inline-flex' | 'hidden';
type Direction = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type Wrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type Gap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type AlignItems = 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline';
type JustifyContent =
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
type AlignContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch';
type AlignSelf = 'auto' | 'center' | 'flex-start' | 'flex-end' | 'baseline' | 'stretch';

interface FlexboxProps {
  display?: Display;
  direction?: Direction;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  gap?: Gap;
  rowGap?: Gap;
  columnGap?: Gap;
  wrap?: Wrap;
  alignContent?: AlignContent;
  alignSelf?: AlignSelf;
  shrink?: Size;
  grow?: Size;
}

export function Flexbox(
  props: { children?: ReactNode } & FlexboxProps & Partial<Record<Breakpoint, FlexboxProps>>
) {
  const className = useMemo(() => {
    const classNames: string[] = ['flexbox'];

    function applyFlexboxProps(classNames: string[], flexboxProps: FlexboxProps, prefix?: string) {
      if (flexboxProps.display) {
        classNames.push(`${prefix}${flexboxProps.display}`);
      }

      if (flexboxProps.direction) {
        classNames.push(`${prefix}${flexboxProps.direction}`);
      }

      if (flexboxProps.alignItems) {
        classNames.push(`${prefix}align-items-${flexboxProps.alignItems}`);
      }

      if (flexboxProps.justifyContent) {
        classNames.push(`${prefix}justify-content-${flexboxProps.justifyContent}`);
      }

      if (flexboxProps.gap) {
        classNames.push(`${prefix}gap-${flexboxProps.gap}`);
      }

      if (flexboxProps.rowGap) {
        classNames.push(`${prefix}row-gap-${flexboxProps.rowGap}`);
      }

      if (flexboxProps.columnGap) {
        classNames.push(`${prefix}column-gap-${flexboxProps.columnGap}`);
      }

      if (flexboxProps.wrap) {
        classNames.push(`${prefix}flex-wrap-${flexboxProps.wrap}`);
      }

      if (flexboxProps.alignContent) {
        classNames.push(`${prefix}align-content-${flexboxProps.alignContent}`);
      }

      if (flexboxProps.alignSelf) {
        classNames.push(`${prefix}align-self-${flexboxProps.alignSelf}`);
      }

      if (flexboxProps.shrink) {
        classNames.push(`${prefix}flex-shrink-${flexboxProps.shrink}`);
      }

      if (flexboxProps.grow) {
        classNames.push(`${prefix}flex-grow-${flexboxProps.grow}`);
      }
    }

    applyFlexboxProps(classNames, props);

    function applyBreakpoint(breakpoint: Breakpoint) {
      const breakpointProps = props[breakpoint];
      if (breakpointProps) {
        applyFlexboxProps(classNames, breakpointProps, `${breakpoint}-`);
      }
    }

    for (const breakpoint of ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']) {
      applyBreakpoint(breakpoint as Breakpoint);
    }

    return classNames.join(' ');
  }, [props]);

  return <div className={className}>{props.children}</div>;
}

export function FlexboxExample() {
  return (
    <Flexbox direction="row" alignItems="baseline">
      <Flexbox direction="column">Content</Flexbox>
    </Flexbox>
  );
}

export function FlexboxResponsiveExample() {
  return (
    <Flexbox
      direction="row"
      alignItems="baseline"
      xs={{ direction: 'column', alignItems: 'center' }}
    >
      Content
    </Flexbox>
  );
}
