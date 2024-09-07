import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '@kbn/core/public';
import {App } from './components/app';

export const renderApp = (
  { notifications, http }: CoreStart,
  params: AppMountParameters
) => {
  ReactDOM.render(
    <App notifications={notifications} />,
    params.element
  );

  return () => ReactDOM.unmountComponentAtNode(params.element);
};
