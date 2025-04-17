import { randomUUID } from 'node:crypto'
import httpContext from 'express-http-context'

/**
 * Middleware that adds a unique identifier to each request and stores
 * the request information in the request-scoped context.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 */
export const requestUUIDMiddleware = (req, res, next) => {
  // Add a request UUID to each request and store information about
  // each request in the request-scoped context.
  req.requestUuid = randomUUID()
  httpContext.set('request', req)

  next()
}
