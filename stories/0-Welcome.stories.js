import React from 'react';
//import { linkTo } from '@storybook/addon-links/dist/ts3.9';
import { Welcome } from '@storybook/react/demo';

export default {
  title: 'Welcome',
  component: Welcome,
};

export const ToStorybook = () => <Welcome showApp={<div></div>} />;

ToStorybook.story = {
  name: 'to Storybook',
};
