/**
 * @file Defines the resource router.
 * @module routes/resourceRouter
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import express from "express"
import { UserController } from "../../../controllers/api/UserController.js"

export const router = express.Router()

const controller = new UserController()
