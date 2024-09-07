import { PluginInitializerContext } from '../../../src/core/server';


//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export async function plugin(initializerContext: PluginInitializerContext) {
  const { MyPluginPlugin } = await import('./plugin');
  return new MyPluginPlugin(initializerContext);
}

export type { MyPluginPluginSetup, MyPluginPluginStart } from './types';
