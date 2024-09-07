// Importar os módulos e tipos necessários
import { IRouter } from '../../../../src/core/server';

// Definir a rota para buscar os índices de lov
export function getLovIndicesRoute(router: IRouter) {
    router.get(
        {
            path: '/api/myPlugin/get_lov_indices',
            validate: false,
        },
        async (context, request, response) => {
            const coreContext = await context.core;
            const client = coreContext.elasticsearch.client.asCurrentUser;
            try {
                // Buscar índices que correspondem ao padrão 'kbn_lov*'
                const { body } = await client.indices.get({
                    index: 'kbn_lov*'
                });

                // Extrair os nomes dos índices da resposta
                const indices = Object.keys(body);
                return response.ok({
                    body: { indices },
                });
            } catch (error) {
                // Log de erro e retorno de uma resposta de erro de servidor
                console.error('Erro ao buscar índices de lov:', error);
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
