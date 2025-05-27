// src/services/firebase.service.js
import admin from 'firebase-admin'
import { logger } from '../config/winston.js'

let app = null

// Initialize Firebase Admin SDK
try {
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  })

  logger.info('Firebase Admin SDK initialized')
} catch (error) {
  logger.error('Firebase Admin SDK initialization error', {
    error: error.message
  })
  console.error('Firebase Admin error:', error)
}

export { admin, app }
