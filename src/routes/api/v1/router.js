/**
 * @file API version 1 router.
 * @module routes/router
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import express from "express"
import { router as userRouter } from "./userRouter.js"

export const router = express.Router()

router.use("/", userRouter)
