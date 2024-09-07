import { IRouter } from '../../../../src/core/server';
import { schema } from '@kbn/config-schema';

export function getIndexDataRoute(router: IRouter) {
  router.get(
    {
      path: '/api/my_plugin/index_data/{index}',
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      const { index } = request.params;

      try {
        // Acessa o cliente Elasticsearch corretamente
        const esClient = (await context.core).elasticsearch.client;

        // Fazendo a busca no índice fornecido
        const result = await esClient.asCurrentUser.search({
          index,
          body: {
            query: {
              match_all: {},
            },
          },
        });

        // Aqui retornamos os documentos encontrados diretamente
        return response.ok({
          body: result.hits.hits, // Retorna os hits diretamente
        });
      } catch (error) {
        return response.customError({
          statusCode: 500,
          body: error.message,
        });
      }
    }
  );
}