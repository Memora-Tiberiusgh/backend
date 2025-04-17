/**
 * @file Defines the image model.
 * @module models/UserModel
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import mongoose from "mongoose"
import { BASE_SCHEMA } from "./baseSchema.js"

// Create a schema.
const schema = new mongoose.Schema({})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const UserModel = mongoose.model("Image", schema)
