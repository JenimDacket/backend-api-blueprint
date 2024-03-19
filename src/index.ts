// Dotenv must be set up before any other import statements
import { config } from 'dotenv';
config();

import bodyParser from 'body-parser';
import compression from 'compression';
import timeout from 'connect-timeout';
import express from 'express';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './build/routes';
import swaggerDocument from './build/swagger.json';
import { validateAccessToken } from './middleware/auth0.validateAccessToken';
import { RegisterErrorHandling } from './middleware/errorHandling';
import { limiter } from './middleware/rateLimiting';
import initSchema from './services/database/schema';
import { createSystemUser } from './services/database/utils/systemUserHelper';
import { createTestUser } from './services/database/utils/testUserHelper';
import { initializeQdrantMemoryStore } from './services/llm/llmKernel/vectorStores/qdrant/getQdrantStore';

try {
  // Initialize postgresDB schema
  const promise1 = initSchema();

  // Initialize qdrant vector store
  const textEmbeddingAda002VectorSize = 1536;
  const promise2 = !process.env.QDRANT_ENDPOINT
    ? Promise.resolve()
    : initializeQdrantMemoryStore(textEmbeddingAda002VectorSize);

  // Wait for schema and vector store to be initialized then initiate express app
  Promise.all([promise1, promise2]).then(async () => {
    console.log('Database schema and vector store initialized');
    const app = express();

    /**
     * Express Middleware
     * Ordering matters here
     * 1. Preroute handling
     * 2. Non-Auth-Protected Routes
     * 3. Auth Handling
     * 4. Auth-Protected Routes
     * 5. Swagger docs
     * 6. Error handling middleware
     */
    console.log('Registering express middleware... ');

    // 3rd party Middleware
    //app.set('trust proxy', true);
    // Define the timeout middleware
    // Set a timeout limit for all requests, e.g., 10 seconds
    app.use(timeout('10s'));
    app.use(compression());
    app.use(bodyParser.json());
    app.use(limiter());

    if (process.env.NODE_ENV === 'development') {
      console.log('Development environment detected. Serving swagger docs...');
      app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
      console.log('API Docs:', '\x1b[36m', 'http://localhost:3000/swagger');
    }

    // Register Auth Middleware, protected routes, and swagger docs
    app.use(validateAccessToken());

    RegisterRoutes(app);

    // Register api error handling middleware after all routes have been registered
    RegisterErrorHandling(app);

    // Create test user if does not exist
    if (process.env.NODE_ENV === 'development') {
      await createTestUser();
    }
    await createSystemUser();

    // Start server
    console.log('Starting express server...');
    const server = http.createServer(app);
    server.listen(3000, () => {
      console.log('\x1b[35m', 'Server is now running on port :3000');
    });
  });
} catch (e) {
  console.log('error starting app: ', e);
}
