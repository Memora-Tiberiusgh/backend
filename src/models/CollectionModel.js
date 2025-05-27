/**
 * @file Defines the Collection model.
 * @module models/CollectionModel
 * @author Tiberius Gherac
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    minlength: [1, 'Collection name must be at least 1 characters'],
    maxlength: [50, 'Collection name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Collection must belong to a user']
  },
  submitted: { type: Boolean, default: false }
})

// Add base schema
schema.add(BASE_SCHEMA)

export const CollectionModel = mongoose.model('Collection', schema)
