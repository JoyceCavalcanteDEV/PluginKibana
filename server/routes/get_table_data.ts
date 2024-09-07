import { IRouter } from '../../../../src/core/server';
import { schema } from '@kbn/config-schema';

export function registerGetTableDataRoute(router: IRouter) {
  router.post(
    {
      path: '/api/myPlugin/get_table_data',
      validate: {
        body: schema.object({
          selectedIndex: schema.string(),
          selectedFields: schema.arrayOf(schema.string()), // Correto para um array de strings
        }),
      },
    },
    async (context, request, response) => {
      try {
        const coreContext = await context.core;
        const client = coreContext.elasticsearch.client.asCurrentUser;

        // Realizando a busca no Elasticsearch
        const result = await client.search({
          index: request.body.selectedIndex,
          _source_includes: request.body.selectedFields,
          version: true,
          size: 10000,
        });

        // A resposta da busca está diretamente em result
        const hits = result.hits.hits;

        return response.ok({
          body: {
              reply: hits, // Mudei "hits" para "reply"
          },
      });
      } catch (error) {
        return response.customError({
          statusCode: error.statusCode || 500,
          body: {
            message: error.message,
          },
        });
      }
    }
  );
}