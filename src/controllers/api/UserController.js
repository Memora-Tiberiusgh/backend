/**
 * @file Defines the UserController class.
 * @module controllers/UserController
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import { logger } from "../../config/winston.js"
import { auth } from "../../services/firebase.js"
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  getAuth,
  signInWithCredential,
} from "firebase/auth"

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Verifies a Firebase token received from client
   */
  async verifyToken(req, res, next) {
    try {
      const { token } = req.body

      // Verify the token with Firebase
      const decodedToken = await auth.verifyIdToken(token)

      res.status(200).json({
        uid: decodedToken.uid,
        email: decodedToken.email,
        verified: true,
      })
    } catch (error) {
      logger.error("Token verification error", { error })
      res.status(401).json({ error: "Invalid token", verified: false })
    }
  }

  /**
   * Completes the logout process
   */
  async logoutPost(req, res, next) {
    try {
      await signOut(auth)
      res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
      logger.error("Logout error", { error })
      res.status(500).json({ error: error.message })
    }
  }
}
