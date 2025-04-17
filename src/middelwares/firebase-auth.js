// src/middlewares/firebase-auth.js
import { auth } from "../services/firebase.js"
import { logger } from "../config/winston.js"

/**
 * Middleware to verify Firebase authentication tokens.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const token = authHeader.split(" ")[1]

    // Verify the token with Firebase
    const decodedToken = await auth.verifyIdToken(token)

    // Add the user ID to the request
    req.userId = decodedToken.uid

    next()
  } catch (error) {
    logger.error("Authentication error", { error })
    res.status(401).json({ error: "Authentication failed" })
  }
}
