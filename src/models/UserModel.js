/**
 * @file Defines the user model.
 * @module models/UserModel
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import mongoose from "mongoose"
import { BASE_SCHEMA } from "./baseSchema.js"

// Create a schema.
const schema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  displayName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  },
  userAddedCollections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
  ],
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const UserModel = mongoose.model("User", schema)
