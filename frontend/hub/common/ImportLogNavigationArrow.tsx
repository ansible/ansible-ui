import styled from 'styled-components';

const arrowStyle = `
  color: white;
  &:hover {
    cursor: pointer;
  }
  position: absolute;
  margin-bottom: 10px;
  margin-right: 10px;
  font-size: 120%;
`;

const StyledArrowDown = styled.div`
  ${arrowStyle}
  right: 0; /* Aligns the icon to the right */
  top: 0; /* Aligns the icon to the top */
`;

const StyledArrowUp = styled.div`
  ${arrowStyle}
  right: 0;
  bottom: 0;
`;

export function NavigationArrow(props: { direction: 'up' | 'down'; onClick: () => void }) {
  const className = `fa fa-arrow-circle-${props.direction} clickable`;

  const Component = props.direction === 'up' ? StyledArrowUp : StyledArrowDown;

  return (
    <Component>
      <span
        role="button"
        onClick={() => {
          props.onClick();
        }}
        onKeyDown={(event) => {
          // Trigger click on Enter key
          if (event.key === 'Enter') {
            props.onClick();
          }
        }}
        tabIndex={props.direction === 'up' ? 0 : 1} // Make the element focusable
        className={className}
      />
    </Component>
  );
}
