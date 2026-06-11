import { Button, ButtonProps } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { SetRequired } from 'type-fest';

/**
 * A button that is a link, using the `Link` component from `react-router`.
 * This makes it easier to create buttons that navigate to other pages.
 * By using a 'Link' component, the navigation is handled by the router, so the page does not reload.
 * icon is optional and defaults to the 'PlusCircleIcon'.
 */
export function ButtonLink(
  props: Omit<SetRequired<ButtonProps, 'href'>, 'onClick'> & { icon?: React.ReactNode }
) {
  const { icon = <PlusCircleIcon />, ...rest } = props;
  return (
    <Button
      component={(props: { href: string }) => <Link to={props.href} {...props} />}
      icon={icon}
      {...rest}
    />
  );
}
