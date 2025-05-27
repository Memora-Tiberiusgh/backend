// src/middlewares/firebase-auth.js
import { admin } from '../services/firebase.js'
import { logger } from '../config/winston.js'
import mongoose from 'mongoose'
import '../models/UserModel.js'

/**
 * Verifies Firebase authentication token and attaches user data to request.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.split('Bearer ')[1]

    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token)

    // Find the MongoDB user by Firebase UID
    const user = await mongoose
      .model('User')
      .findOne({ firebaseUid: decodedToken.uid })

    if (!user) {
      return res.status(401).json({ error: 'User not found in database' })
    }

    // Attach the user data to the request
    req.user = user

    next()
  } catch (error) {
    logger.error('Authentication error', { error: error.message })
    next(error)
  }
}
