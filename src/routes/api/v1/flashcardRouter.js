/**
 * @file Defines the flashcardRouter router.
 * @module routes/flashcardRouter
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import express from 'express'
import { FlashcardController } from '../../../controllers/api/FlashcardController.js'

export const router = express.Router()

const controller = new FlashcardController()

// Provide req.collection to the route if :flashcardId is present in the route path.
router.param('flashcardId', (req, res, next, flashcardId) =>
  controller.loadFlashcardDocument(req, res, next, flashcardId)
)

router.post('/', async (req, res, next) =>
  controller.createFlashcard(req, res, next)
)

router.get('/:flashcardId', async (req, res, next) =>
  controller.getFlashcard(req, res, next)
)

router.patch('/:flashcardId', async (req, res, next) =>
  controller.updateFlashcard(req, res, next)
)

router.delete('/:flashcardId', async (req, res, next) =>
  controller.deleteFlashcard(req, res, next)
)

// Get all flashcards for a specific collection
router.get('/collections/:collectionId', async (req, res, next) =>
  controller.getFlashcardsByCollection(req, res, next)
)
