import { app } from '@azure/functions';
import { toAzureResponse } from '../lib/api-handler.js';
import { health } from '../lib/health.js';

// authLevel anonymous: a health check carries no data worth protecting.
app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: (_request, context) => toAzureResponse(health(Date.now()), context),
});
