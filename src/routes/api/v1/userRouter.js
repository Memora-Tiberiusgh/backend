/**
 * @file Defines the user router.
 * @module routes/userRouter
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import express from "express"
import { UserController } from "../../../controllers/api/UserController.js"

export const router = express.Router()

const controller = new UserController()

router.post("/verify-token", async (req, res, next) =>
  controller.verifyToken(req, res, next)
)

router.post("/", async (req, res, next) =>
  controller.createUserPost(req, res, next)
)
