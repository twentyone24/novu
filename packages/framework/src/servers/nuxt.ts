import { getHeader, getQuery, H3Event, readBody, send, setHeaders } from 'h3';

import { NovuRequestHandler, type ServeHandlerOptions } from '../handler';
import { type SupportedFrameworkName } from '../types';

export const frameworkName: SupportedFrameworkName = 'nuxt';

export const serve = (options: ServeHandlerOptions) => {
  const handler = new NovuRequestHandler({
    frameworkName,
    ...options,
    /*
     * TODO: Fix this
     */
    handler: (event: H3Event) => ({
      queryString: (key) => String(getQuery(event)[key]),
      body: () => readBody(event),
      headers: (key) => getHeader(event, key),
      url: () =>
        new URL(
          String(event.path),
          `${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${String(getHeader(event, 'host'))}`
        ),
      method: () => event.method,
      transformResponse: (actionRes) => {
        const { res } = event.node;

        res.statusCode = actionRes.status;
        setHeaders(event, actionRes.headers);

        return send(event, actionRes.body);
      },
    }),
  });

  return handler.createHandler();
};
