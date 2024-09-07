import './index.scss';

import { MyPluginPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new MyPluginPlugin();
}
export type { MyPluginPluginSetup, MyPluginPluginStart } from './types';
