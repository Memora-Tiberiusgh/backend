/**
 * @file Defines the user router.
 * @module routes/userRouter
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import express from 'express'
import { UserController } from '../../../controllers/api/UserController.js'
import { verifyFirebaseToken } from '../../../middelwares/firebase-auth.js'

export const router = express.Router()

const controller = new UserController()

router.post('/', async (req, res, next) =>
  controller.createUserPost(req, res, next)
)

// Need to verify the user and add it to the request body
// Add or remove a collection in the user's "userAddedCollections"
router.put(
  '/collections/:collectionId',
  verifyFirebaseToken,
  async (req, res, next) =>
    controller.toggleCollectionInUserAddedCollections(req, res, next)
)
