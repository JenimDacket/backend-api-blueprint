import { trace } from '@opentelemetry/api';

export const ApiServiceTracer = trace.getTracer('talk2me.api.service', '0.0.1');
