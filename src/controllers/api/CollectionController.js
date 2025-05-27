/**
 * @file Defines the CollectionController class.
 * @module controllers/api/CollectionController
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import { logger } from '../../config/winston.js'
import { CollectionModel } from '../../models/CollectionModel.js'
import { FlashcardModel } from '../../models/FlashcardModel.js'
import xss from 'xss'

/**
 * Handles validation errors by returning the error message.
 *
 * @param {Error} error - The error object to handle.
 * @returns {string} The error message.
 */
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    return error.message
  }
  return error.message
}

/**
 * Encapsulates the controller for the collection.
 */
export class CollectionController {
  /**
   * Middleware to load a collection document by its ID and check user access.
   *
   * Attaches the collection to the request object if the user is the creator or the collection is public.
   * Calls next() if access is denied or after attaching the collection.
   *
   * @async
   * @function
   * @param {import('express').Request} req - Express request object, expects `user` property.
   * @param {import('express').Response} res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   * @param {string} collectionId - The ID of the collection to load.
   * @returns {Promise<void>}
   */
  async loadCollectionDocument(req, res, next, collectionId) {
    try {
      const user = req.user

      // Find the collection that either belongs to the user or is public
      const collection = await CollectionModel.findById(collectionId)

      const hasAccess =
        collection.creator.equals(user._id) || collection.isPublic

      if (!hasAccess) {
        next()
      }

      // Attach the collection to the request object
      req.collection = collection
      next()
    } catch (error) {
      logger.error(error.message)
      next(error)
    }
  }

  /**
   * Creates a new collection with the provided name and description.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async createCollection(req, res, next) {
    try {
      const { name, description } = req.body

      // Create new collection with user information
      const collection = new CollectionModel({
        name: xss(name),
        description: description ? xss(description) : undefined,
        creator: req.user
      })

      await collection.save()

      logger.info('Collection created successfully', {
        collectionId: collection.id,
        userId: req.user.uid
      })

      res.status(201).json(collection)
    } catch (error) {
      logger.error('Error creating collection', {
        error: error.message,
        stack: error.stack
      })

      if (error.name === 'ValidationError') {
        return res.status(400).json(handleValidationError(error))
      }
      next(error)
    }
  }

  /**
   * Handles GET requests to retrieve collections for the authenticated user.
   *
   * Finds all collections that are either:
   * - Created by the user and not public, or
   * - Included in the user's `userAddedCollections` array.
   *
   * @async
   * @function collectionsGet
   * @param {import('express').Request} req - Express request object, expects `user` property.
   * @param {import('express').Response} res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Sends a JSON array of collections with status 200, or passes error to next middleware.
   */
  async collectionsGet(req, res, next) {
    try {
      const user = req.user

      // Find all collections that are either:
      // - Created by this user AND NOT public, OR
      // - In the user's userAddedCollections array
      const collections = await CollectionModel.find({
        $or: [
          { creator: user.id, isPublic: false },
          { _id: { $in: user.userAddedCollections || [] } }
        ]
      })
      res.status(200).json(collections)
    } catch (error) {
      logger.error(error.message)
      next(error)
    }
  }

  /**
   * Updates an existing collection with the provided name and/or description.
   * Assumes the collection document is already attached to the request object.
   *
   * @async
   * @function
   * @param {import('express').Request} req - Express request object, with the collection attached as req.collection and updated fields in req.body.
   * @param {import('express').Response} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} Sends the updated collection as JSON on success, or an error response on failure.
   */
  async updateCollection(req, res, next) {
    try {
      // No need to check if the request is from the creator here since i do that when i load the document and attach it to the request
      const collection = req.collection
      const { name, description } = req.body

      // Update only the fields that were provided
      if (name !== undefined) collection.name = xss(name)
      if (description !== undefined) collection.description = xss(description)

      await collection.save()

      res.status(200).json(collection)
    } catch (error) {
      logger.error(error.message)

      if (error.name === 'ValidationError') {
        return res.status(400).json(handleValidationError(error))
      }

      next(error)
    }
  }

  /**
   * Deletes a collection and all associated flashcards.
   *
   * @async
   * @function deleteCollection
   * @param {import('express').Request} req - Express request object, with the collection attached to `req.collection`.
   * @param {import('express').Response} res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Sends a 204 No Content response on success.
   * @throws Will call next with an error if deletion fails.
   */
  async deleteCollection(req, res, next) {
    try {
      // Even delete the flascards associated with this collection
      // No need to check if the request is from the creator here since i do that when i load the document and attach it to the request
      await FlashcardModel.deleteMany({ collectionId: req.collection._id })

      // Delete the collection
      await req.collection.deleteOne()

      res.status(204).send()
    } catch (error) {
      logger.error(error.message)
      next(error)
    }
  }

  /**
   * Retrieves a specific collection by ID.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async getCollection(req, res, next) {
    try {
      if (!req.collection) {
        return res.status(404).json({ message: 'Collection not found' })
      }

      res.status(200).json(req.collection)
    } catch (error) {
      logger.error('Error retrieving collection', {
        error: error.message,
        stack: error.stack
      })
      next(error)
    }
  }

  /**
   * Submits a collection for public review by the creator.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async getPublicCollections(req, res, next) {
    try {
      const user = req.user

      // Using aggregation for a more complete result set
      const publicCollections = await CollectionModel.aggregate([
        // Step 1: Filter to only include public collections
        { $match: { isPublic: true } },

        // Step 2: Look up the creator information
        {
          $lookup: {
            from: 'users', // Your users collection name
            localField: 'creator',
            foreignField: '_id',
            as: 'creatorInfo'
          }
        },

        // Step 3: Look up the flashcards with a sample pipeline
        {
          $lookup: {
            from: 'flashcards',
            let: { collectionId: '$_id' },
            pipeline: [
              {
                $match: { $expr: { $eq: ['$collectionId', '$$collectionId'] } }
              },
              { $sample: { size: 5 } } // Get up to 5 random cards
            ],
            as: 'previewCards'
          }
        },

        // Step 4: Separate lookup to get all flashcards for counting
        {
          $lookup: {
            from: 'flashcards',
            localField: '_id',
            foreignField: 'collectionId',
            as: 'allFlashcards'
          }
        },

        // Step 5: Add computed fields
        {
          $addFields: {
            cardCount: { $size: '$allFlashcards' },
            creatorName: { $arrayElemAt: ['$creatorInfo.displayName', 0] },
            isAddedByUser: {
              $in: ['$_id', user.userAddedCollections || []]
            }
          }
        },

        // Step 6: Project only the fields we need
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            isPublic: 1,
            createdAt: 1,
            updatedAt: 1,
            creator: 1,
            creatorName: 1,
            cardCount: 1,
            isAddedByUser: 1,
            previewCards: 1
          }
        }
      ])

      res.status(200).json(publicCollections)
    } catch (error) {
      logger.error('Error retrieving public collections', {
        error: error.message,
        stack: error.stack
      })
      next(error)
    }
  }

  /**
   * Submits a collection for public review by the creator.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async submitForPublic(req, res, next) {
    try {
      const collection = req.collection

      // Only allow the creator to submit
      if (!collection.creator.equals(req.user._id)) {
        return res.send(404)
      }

      // Check if already submitted
      if (collection.submitted) {
        return res.status(400).json({
          message: 'This collection has already been submitted for review'
        })
      }

      // Get card count for quality assessment
      const cardCount = await FlashcardModel.countDocuments({
        collectionId: collection._id
      })

      // Mark as submitted
      collection.submitted = true
      await collection.save()

      // Log the submission
      logger.info(
        `Collection "${collection.name}" submitted for public review`,
        {
          event: 'collection_submission',
          collection: {
            id: collection._id,
            name: collection.name,
            description: collection.description,
            cardCount
          },
          creator: {
            id: req.user._id,
            displayName: req.user.displayName,
            email: req.user.email
          }
        }
      )

      res.status(200).json({
        message: 'Your collection has been submitted for public review.'
      })
    } catch (error) {
      logger.error(`Error submitting collection: ${error.message}`, {
        error: error.message,
        stack: error.stack
      })
      next(error)
    }
  }
}
