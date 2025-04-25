/**
 * @file Defines the CollectionController class.
 * @module controllers/api/CollectionController
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import { logger } from "../../config/winston.js"
import { CollectionModel } from "../../models/CollectionModel.js"

/**
 * Handles validation errors from Mongoose
 * @param {Error} error - The error object
 * @returns {Object} Formatted error messages
 */
const handleValidationError = (error) => {
  if (error.name === "ValidationError") {
    return error.message
  }

  return { error: error.message }
}

/**
 * Encapsulates a controller.
 */
export class CollectionController {
  async loadCollectionDocument(req, res, next, collectionId) {
    try {
      const user = req.user

      // Find the collection that either belongs to the user or is public
      const collection = await CollectionModel.findOne({
        _id: collectionId,
        $or: [{ creator: user._id }, { isPublic: true }],
      })

      // Attach the collection to the request object
      req.collection = collection
      next()
    } catch (error) {
      logger.error(error.message)
      next(error)
    }
  }

  /**
   * Create a new collection
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async createCollection(req, res, next) {
    try {
      const { name, description } = req.body

      // Create new collection with user information
      const collection = new CollectionModel({
        name,
        description,
        creator: req.user,
      })

      await collection.save()

      logger.info("Collection created successfully", {
        collectionId: collection.id,
        userId: req.user.uid,
      })

      res.status(201).json(collection)
    } catch (error) {
      logger.error("Error creating collection", {
        error: error.message,
        stack: error.stack,
      })

      if (error.name === "ValidationError") {
        return res.status(400).json(handleValidationError(error))
      }
      next(error)
    }
  }

  async collectionsGet(req, res, next) {
    try {
      const user = req.user

      // Find collections that are either created by the current user OR are public
      const collections = await CollectionModel.find({
        $or: [{ creator: user.id }, { isPublic: true }],
      })
      res.status(200).json(collections)
    } catch (error) {
      logger.error(error.message)
      next(error)
    }
  }

  // Update a collection
  async updateCollection(req, res, next) {
    try {
      // No need to check if the request is from the creator here since i do that when i load the document and attach it to the request
      const collection = req.collection
      const { name, description } = req.body

      // Update only the fields that were provided
      if (name !== undefined) collection.name = name
      collection.description = description

      await collection.save()

      res.status(200).json(collection)
    } catch (error) {
      logger.error(error.message)
      next(error)
    }
  }

  // Delete a collection
  async deleteCollection(req, res, next) {
    try {
      //:TODO: Even delete the flascards associated with this collection
      //   await FlashcardModel.deleteMany({ collectionId: collection._id });

      // No need to check if the request is from the creator here since i do that when i load the document and attach it to the request

      // Delete the collection
      await req.collection.deleteOne()

      res.status(204).send()
    } catch (error) {
      logger.error(error.message)
      next(error)
    }
  }

  /**
   * Get a single collection by ID
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getCollection(req, res, next) {
    try {
      if (!req.collection) {
        return res.status(404).json({ message: "Collection not found" })
      }

      res.status(200).json(req.collection)
    } catch (error) {
      logger.error("Error retrieving collection", {
        error: error.message,
        stack: error.stack,
      })
      next(error)
    }
  }
}
