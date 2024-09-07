import { IRouter } from '../../../../src/core/server';
import { registerGetTableDataRoute } from './get_table_data';
import { registerUpdateItemRoute } from './update_item';
import { getLovIndicesRoute } from './get_lov_indices';
import { getIndexDataRoute } from './get_index_data'; // Importando a nova rota

export function defineRoutes(router: IRouter) {
  registerGetTableDataRoute(router);
  registerUpdateItemRoute(router);
  getLovIndicesRoute(router);
  getIndexDataRoute(router); // Registrando a nova rota
}