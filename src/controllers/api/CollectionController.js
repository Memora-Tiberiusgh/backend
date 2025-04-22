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
    const errors = {}

    // Extract specific validation error messages from the model
    Object.keys(error.errors).forEach((field) => {
      errors[field] = error.errors[field].message
    })

    return errors
  }

  return { error: error.message }
}

/**
 * Encapsulates a controller.
 */
export class CollectionController {
  /**
   * Create a new collection
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  async createCollection(req, res, next) {
    try {
      const { name, description, isPublic } = req.body

      // Create new collection with user information
      const collection = new CollectionModel({
        name,
        description,
        isPublic,
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
}

// const mockupData = [
//   {
//     id: 1,
//     name: "Swedish Basics",
//     isPublic: false,
//     cards: [
//       { question: "Hur säger man 'hello' på svenska?", answer: "Hej" },
//       { question: "Vad är 'thank you' på svenska?", answer: "Tack" },
//     ],
//   },
//   {
//     id: 2,
//     name: "French Vocabulary",
//     isPublic: false,
//     cards: [
//       {
//         question: "Comment dit-on 'hello' en français?",
//         answer: "Bonjour",
//       },
//       {
//         question: "Comment dit-on 'thank you' en français?",
//         answer: "Merci",
//       },
//     ],
//   },
//   {
//     id: 3,
//     name: "JavaScript Fundamentals",
//     isPublic: false,
//     cards: [
//       {
//         question: "What is a closure in JavaScript?",
//         answer:
//           "A function that has access to its own scope, the outer function's scope, and the global scope",
//       },
//       {
//         question: "Hur loggar man i consolen i JavaScript?",
//         answer: "Man frågar chatGPT",
//       },
//       {
//         question: "What is the difference between let and var?",
//         answer: "let is block-scoped, var is function-scoped",
//       },
//     ],
//   },
//   {
//     id: 4,
//     name: "AI Prompt Engineering",
//     isPublic: true,
//     cards: [
//       {
//         question: "What is a prompt?",
//         answer: "Instructions given to an AI to guide its output",
//       },
//       {
//         question: "What is temperature in AI?",
//         answer: "A parameter that controls randomness in generation",
//       },
//     ],
//   },
//   {
//     id: 5,
//     name: "Computer Science",
//     isPublic: false,
//     cards: [
//       {
//         question: "What is a data structure?",
//         answer: "A specialized format for organizing and storing data",
//       },
//       {
//         question: "What is an algorithm?",
//         answer: "A step-by-step procedure for solving a problem",
//       },
//     ],
//   },
//   {
//     id: 6,
//     name: "Programming Tips",
//     isPublic: true,
//     cards: [
//       {
//         question: "What is DRY?",
//         answer: "Don't Repeat Yourself - a principle to reduce repetition",
//       },
//       {
//         question: "What is SOLID?",
//         answer:
//           "Five design principles for OOP: Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion",
//       },
//     ],
//   },
// ]
