import React from 'react';
import { LoadingState } from "../framework/components/LoadingState";
import { LoadingPage } from "../framework/components/LoadingPage";

export default {
    title: 'Loading states',
};

export const LoadingStateForPage = (props) => <LoadingPage {...props} />;
export const LoadingStateForPageContent = () => <LoadingState />;

LoadingStateForPage.props = {
    title: 'Page title'
};
LoadingStateForPage.argTypes = {
    title: { type: 'string' }
};
