/**
 * @file Defines the main application.
 * @module src/server
 * @author Tiberius Gherac
 */

import httpContext from "express-http-context" // Must be first!
import "@lnu/json-js-cycle"
import express from "express"
import helmet from "helmet"
import { connectToDatabase } from "./config/mongoose.js"
import { morganLogger } from "./config/morgan.js"
import { logger } from "./config/winston.js"
import { router } from "./routes/router.js"
import { errorHandler } from "./middelwares/error-handler.js"
import { requestUUIDMiddleware } from "./middelwares/request-uuid.js"
import cors from "cors"

try {
  // Connect to MongoDB.
  await connectToDatabase(process.env.DB_CONNECTION_STRING)

  // Create an Express application.
  const app = express()

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())

  //REMOVE
  // Configure CORS based on environment
  if (process.env.NODE_ENV === "development") {
    // For development: Allow requests from development frontend
    app.use(
      cors({
        origin: "*",
        credentials: true,
      })
    )
    logger.info("CORS configured for development environment")
  }

  // Parse requests of the content type application/json.
  app.use(express.json())

  // Add the request-scoped context.
  // NOTE! Must be placed before any middle that needs access to the context!
  //       See https://www.npmjs.com/package/express-http-context.
  app.use(httpContext.middleware)

  // Use a morgan logger.
  app.use(morganLogger)

  // RequestUUID middelware to be executed before the routes.
  app.use(requestUUIDMiddleware)

  // Register routes.
  app.use("/", router)

  // Error handler.
  app.use(errorHandler)

  // Starts the HTTP server listening for connections.
  const server = app.listen(process.env.PORT, () => {
    logger.info(`Server running at http://localhost:${server.address().port}`)
    logger.info("Press Ctrl-C to terminate...")
  })
} catch (err) {
  logger.error(err.message, { error: err })
  process.exitCode = 1
}
