import React from 'react';
import { Help } from '../framework/components/Help';

export default {
  title: 'Help',
};

export const HelpPopOver = (props) => <Help {...props} />;

HelpPopOver.args = {
  title: "Title of a help",
  help: <span>This is a body of help</span>,
};
HelpPopOver.argTypes = {
  title: { type: 'string' },
};
