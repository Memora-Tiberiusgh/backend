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

// Provide req.collection to the route if :id is present in the route path.
router.param("collectionId", (req, res, next, collectionId) =>
  controller.loadCollectionDocument(req, res, next, collectionId)
)

router.get("/", async (req, res, next) =>
  controller.collectionsGet(req, res, next)
)

router.post("/", async (req, res, next) =>
  controller.createCollection(req, res, next)
)

router.get("/:collectionId", async (req, res, next) =>
  controller.loadCollectionDocument(req, res, next)
)
router.patch("/:collectionId", async (req, res, next) =>
  controller.updateCollection(req, res, next)
)
router.delete("/:collectionId", async (req, res, next) =>
  controller.deleteCollection(req, res, next)
)
