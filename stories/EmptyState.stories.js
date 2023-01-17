import React from 'react';
import { Button } from '@patternfly/react-core/dist/esm/index';
import { EmpireIcon, RebelIcon } from '@patternfly/react-icons/dist/esm/index';
import { EmptyStateCustom } from '../framework/components/EmptyStateCustom';
import { EmptyStateFilter } from '../framework/components/EmptyStateFilter';
import { EmptyStateNoData } from '../framework/components/EmptyStateNoData';
import { EmptyStateUnauthorized } from '../framework/components/EmptyStateUnauthorized';

export default {
  title: 'EmptyState',
};

export const Custom = (props) => <EmptyStateCustom {...props} />;
export const Filter = (props) => <EmptyStateFilter {...props} />;
export const NoData = (props) => <EmptyStateNoData {...props} />;
export const Unauthorized = (props) => <EmptyStateUnauthorized {...props} />;

Custom.args = {
  button: <Button>Foobar</Button>,
  description: 'Lorem ipsum dolor',
  title: 'Quux',
  icon: 'Rebel',
};
Custom.argTypes = {
  icon: {
    control: 'select',
    options: ['no icon', 'Rebel', 'Empire'],
    mapping: {
      'no icon': null,
      'Rebel': RebelIcon,
      'Empire': EmpireIcon,
    },
  },
};

Filter.args = {
  button: undefined,
  clearAllFilters: () => console.log('cleared'),
  description: undefined,
  title: undefined,
};
Filter.argTypes = {
  button: { type: 'string' },
  description: { type: 'string' },
  title: { type: 'string' },
};

NoData.args = {
  button: <Button>Upload</Button>,
  description: 'Collections will appear once uploaded',
  title: 'No collections yet',
};

Unauthorized.args = {
  adminMessage: undefined,
  loginLink: <Button>Login</Button>,
  title: undefined,
};
Unauthorized.argTypes = {
  adminMessage: { type: 'string' },
  title: { type: 'string' },
};
