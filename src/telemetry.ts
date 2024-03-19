// Dotenv must be set up before any other import statements
import { config } from 'dotenv';
config();

import { DiagConsoleLogger, DiagLogLevel, diag, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const ApiServiceTracer = trace.getTracer('talk2me.api.service', '0.0.1');

// Logging for opentelemetry
if (process.env.NODE_ENV === 'development') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);
}

// Configure the resource with your service name
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'talk2meapi',
});

// Initialize the tracer provider with your resource
const provider = new NodeTracerProvider({ resource });

// Configure the OTLP exporter to point to your Grafana Tempo instance
const otlpExporter = new OTLPTraceExporter({
  url: process.env.GRAPHANA_OTLP_ENDPOINT + '/v1/traces', // must end with /v1/traces
  headers: {
    Authorization: `Basic ${process.env.GRAPHANA_OTLP_AUTH_TOKEN}`,
  },
});

// Use the BatchSpanProcessor for better performance
provider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));

// Register the provider to begin tracing
provider.register();

// Automatic instrumentation
// See whats tracked with OTEL_NODE_RESOURCE_DETECTORS env variable
registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});
