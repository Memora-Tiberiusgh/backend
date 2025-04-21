/**
 * @file Defines the Flashcard model.
 * @module models/FlashcardModel
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import mongoose from "mongoose"
import { BASE_SCHEMA } from "./baseSchema.js"

const flashcardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
    trim: true,
    minlength: [3, "Question must be at least 3 characters"],
    maxlength: [500, "Question cannot exceed 500 characters"],
  },
  answer: {
    type: String,
    required: [true, "Answer is required"],
    trim: true,
    minlength: [1, "Answer must be at least 1 character"],
    maxlength: [1000, "Answer cannot exceed 1000 characters"],
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
    required: [true, "Flashcard must belong to a collection"],
    index: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Flashcard must belong to a user"],
  },
})

// Add base schema
flashcardSchema.add(BASE_SCHEMA)

// Create indexes for efficient querying
flashcardSchema.index({ collectionId: 1, createdAt: -1 })
flashcardSchema.index({ tags: 1 })

export const FlashcardModel = mongoose.model("Flashcard", flashcardSchema)
