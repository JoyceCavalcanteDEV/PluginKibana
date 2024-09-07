import { IRouter } from '../../../../src/core/server';
import { schema } from '@kbn/config-schema';

export function registerUpdateItemRoute(router: IRouter) {
  router.post(
    {
      path: '/api/myPlugin/update_item',
      validate: {
        body: schema.object({
          index: schema.string(),
          id: schema.string(),
          updatedFields: schema.recordOf(schema.string(), schema.any()),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const coreContext = await context.core;
        const client = coreContext.elasticsearch.client.asCurrentUser;

        // Atualizando o documento no Elasticsearch
        await client.update({
          index: request.body.index,
          id: request.body.id,
          body: {
            doc: request.body.updatedFields,
          },
        });

        return response.ok({
          body: {
            message: 'Item atualizado com sucesso!',
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
