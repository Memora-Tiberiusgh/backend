/**
 * @file Defines the UserController class.
 * @module controllers/api/UserController
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import { logger } from "../../config/winston.js"
import { UserModel } from "../../models/UserModel.js"
import xss from "xss"

/**
 * Encapsulates a controller.
 */
export class UserController {
  async createUserPost(req, res, next) {
    try {
      // Get data from request body here since we only attach it to the req.user after this part
      const { uid, displayName, email } = req.body

      if (!uid) {
        return res.status(400).json({ error: "Missing required field: uid" })
      }

      // Check if user already exists
      let user = await UserModel.findOne({ firebaseUid: uid })

      if (!user) {
        // Create new user if doesn't exist
        logger.info("Creating new user", { uid })
        user = new UserModel({
          firebaseUid: uid,
          displayName: xss(displayName),
          email: xss(email),
        })

        await user.save()
        logger.info("User created successfully", { uid })
      }
      res.status(201).json(user)
    } catch (error) {
      logger.error("Error creating/getting user", { error: error.message })
      next(error)
    }
  }
}
