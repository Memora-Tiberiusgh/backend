/**
 * @file Defines the FlashcardController class.
 * @module controllers/api/FlashcardController
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import { logger } from "../../config/winston.js"
import { FlashcardModel } from "../../models/FlashcardModel.js"
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

  return error.message
}

/**
 * Encapsulates a controller for flashcard operations.
 */
export class FlashcardController {
  /**
   * Loads a flashcard document and attaches it to the request object
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   * @param {string} flashcardId - ID of the flashcard to load
   */
  async loadFlashcardDocument(req, res, next, flashcardId) {
    try {
      const user = req.user

      // Find the flashcard and check permissions
      const flashcard = await FlashcardModel.findById(flashcardId)

      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" })
      }

      // Find the collection to check if it's public or belongs to the user
      const collection = await CollectionModel.findById(flashcard.collectionId)

      if (!collection) {
        return res
          .status(404)
          .json({ message: "Associated collection not found" })
      }

      // Check if user has access to this flashcard through collection permissions
      if (!collection.isPublic && !collection.creator.equals(user.id)) {
        return res
          .status(403)
          .json({ message: "Access denied to this flashcard" })
      }

      // Attach the flashcard to the request object
      req.flashcard = flashcard
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create a new flashcard
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async createFlashcard(req, res, next) {
    try {
      const { question, answer, collectionId } = req.body
      const user = req.user

      // Verify the collection exists and user has access to it
      const collection = await CollectionModel.findById(collectionId)

      if (!collection) {
        return res.status(404).json({ message: "Collection not found" })
      }

      // Check if user owns the collection
      if (!collection.creator.equals(user.id)) {
        return res.status(403).json({
          message:
            "You can't create flashcard in collections that are not created by you",
        })
      }

      // Create new flashcard
      const flashcard = new FlashcardModel({
        question,
        answer,
        collectionId,
        creator: user,
      })

      await flashcard.save()

      logger.info("Flashcard created successfully")

      res.status(201).json(flashcard)
    } catch (error) {
      logger.error("Error creating flashcard", {
        error: error.message,
        stack: error.stack,
      })

      if (error.name === "ValidationError") {
        return res.status(400).json(handleValidationError(error))
      }

      next(error)
    }
  }

  /**
   * Get a specific flashcard
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getFlashcard(req, res, next) {
    try {
      if (!req.flashcard) {
        return res.status(404).json({ message: "Collection not found" })
      }
      // The flashcard is already loaded by the param middleware
      res.status(200).json(req.flashcard)
    } catch (error) {
      logger.error(`Error retrieving flashcard: ${error.message}`)
      next(error)
    }
  }

  /**
   * Update a flashcard
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async updateFlashcard(req, res, next) {
    try {
      const flashcard = req.flashcard
      const { question, answer } = req.body

      // If flashcard was attached to the request (if the user is behörig)
      if (!flashcard) {
        return res.status(403).json({
          message: "You don't have permission to edit this flashcard",
        })
      }

      // Update only the fields that were provided
      if (question !== undefined) flashcard.question = question
      if (answer !== undefined) flashcard.answer = answer

      await flashcard.save()

      logger.info(`Flashcard updated successfully`)

      res.status(200).json(flashcard)
    } catch (error) {
      logger.error(`Error updating flashcard: ${error.message}`)

      if (error.name === "ValidationError") {
        return res.status(400).json(handleValidationError(error))
      }

      next(error)
    }
  }

  /**
   * Delete a flashcard
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async deleteFlashcard(req, res, next) {
    try {
      const flashcard = req.flashcard

      // If flashcard was attached to the request (if the user is behörig)
      if (!flashcard) {
        return res.status(403).json({
          message: "You don't have permission to delete this flashcard",
        })
      }

      // Delete the flashcard
      await flashcard.deleteOne()

      logger.info(`Flashcard deleted successfully`)

      res.status(204).send()
    } catch (error) {
      logger.error(`Error deleting flashcard: ${error.message}`)
      next(error)
    }
  }

  /**
   * Get all flashcards for a specific collection
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async getFlashcardsByCollection(req, res, next) {
    try {
      const { collectionId } = req.params
      const user = req.user

      // Verify the collection exists and user has access to it
      const collection = await CollectionModel.findOne({
        _id: collectionId,
        $or: [{ creator: user._id }, { isPublic: true }],
      })

      if (!collection) {
        return res.status(404).json({ message: "Collection not found" })
      }

      // Fetch all flashcards for this collection
      const flashcards = await FlashcardModel.find({ collectionId })

      res.status(200).json({ flashcards })
    } catch (error) {
      next(error)
    }
  }
}
