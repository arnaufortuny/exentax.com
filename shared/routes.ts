import { z } from 'zod';
import { insertLlcApplicationSchema, insertApplicationDocumentSchema, products, orders, llcApplications, applicationDocuments } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { product: typeof products.$inferSelect; application: typeof llcApplications.$inferSelect | null }>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: z.object({
        productId: z.number(),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  llc: {
    get: {
      method: 'GET' as const,
      path: '/api/llc/:id',
      responses: {
        200: z.custom<typeof llcApplications.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/llc/:id',
      input: insertLlcApplicationSchema.partial(),
      responses: {
        200: z.custom<typeof llcApplications.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    getByCode: {
      method: 'GET' as const,
      path: '/api/llc/code/:code',
      responses: {
        200: z.custom<typeof llcApplications.$inferSelect & { documents: (typeof applicationDocuments.$inferSelect)[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  documents: {
    create: {
      method: 'POST' as const,
      path: '/api/documents',
      input: insertApplicationDocumentSchema,
      responses: {
        201: z.custom<typeof applicationDocuments.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/documents/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
