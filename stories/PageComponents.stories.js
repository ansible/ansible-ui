import React from 'react';
import { PageHeader } from "../framework/PageHeader";

export default {
    title: 'Page',
};

export const PageHeaderComponent = (props) => <PageHeader {...props} />;

PageHeaderComponent.args = {
    title: 'Page title',
    description: 'Page description'
};
PageHeaderComponent.argTypes = {
    title: { type: 'string' },
    description: { type: 'string' }
};
