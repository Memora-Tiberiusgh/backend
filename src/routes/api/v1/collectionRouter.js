/**
 * @file Defines the collectionRouter router.
 * @module routes/collectionRouter
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import express from "express"
import { CollectionController } from "../../../controllers/api/CollectionController.js"

export const router = express.Router()

const controller = new CollectionController()

router.get("/", async (req, res, next) =>
  controller.collectionsGet(req, res, next)
)

router.post("/", async (req, res, next) =>
  controller.createCollection(req, res, next)
)
