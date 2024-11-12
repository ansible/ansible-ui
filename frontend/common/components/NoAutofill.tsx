import { Fragment } from 'react';

export function NoAutofillDiv() {
  return (
    <Fragment>
      <input id="no_name" type="text" style={{ display: 'none' }} value="" name="no_name"></input>
      <input id="no_pwd" type="password" style={{ display: 'none' }} value="" name="no_pwd"></input>
    </Fragment>
  );
}
