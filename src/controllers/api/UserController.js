/**
 * @file Defines the UserController class.
 * @module controllers/api/UserController
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import { logger } from "../../config/winston.js"
import { UserModel } from "../../models/UserModel.js"
import { CollectionModel } from "../../models/CollectionModel.js"
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
        // Two public collections that will be assigned to each new user
        const defaultCollectionIds = [
          "68162434eb00990068571c55",
          "681f113501be6d322360b462",
        ]

        // Create new user if doesn't exist
        logger.info("Creating new user", { uid })
        user = new UserModel({
          firebaseUid: uid,
          displayName: xss(displayName),
          email: xss(email),
          userAddedCollections: defaultCollectionIds,
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

  // Toggle collection in user's library (add if not present, remove if present)
  async toggleCollectionInUserAddedCollections(req, res, next) {
    try {
      const { collectionId } = req.params
      const user = req.user

      // Check if user already has this collection
      const hasCollection = user.userAddedCollections.some(
        (id) => id.toString() === collectionId
      )

      let operation, message
      if (hasCollection) {
        operation = { $pull: { userAddedCollections: collectionId } }
        message = "Collection removed from library"
      } else {
        // Verify the collection exists before adding
        const collectionExists = await CollectionModel.exists({
          _id: collectionId,
        })
        if (!collectionExists) {
          return res.status(404).json({ message: "Collection not found" })
        }

        operation = { $addToSet: { userAddedCollections: collectionId } }
        message = "Collection added to library"
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        user._id,
        operation,
        {
          new: true,
        }
      )

      res.status(200).json({
        message,
        userAddedCollections: updatedUser.userAddedCollections,
      })
    } catch (error) {
      next(error)
    }
  }
}
