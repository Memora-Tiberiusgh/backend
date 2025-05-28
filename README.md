# Memora Backend

A robust Node.js backend API for the Memora flashcard application - a web-based memory training tool that helps users create, manage, and study flashcards.

🌐 **Live Demo**: [memora.tiberiusgh.com](https://memora.tiberiusgh.com)

## 🚀 Features

- **User Management**: Firebase Authentication integration with MongoDB for persistent user profiles
- **Flashcard Collections**: Create, update, delete, and manage flashcard collections
- **Individual Flashcards**: Full CRUD operations for flashcards within collections
- **Public Collections**: Share collections publicly and browse community content
- **Access Control**: Role-based permissions for collections and flashcards
- **Comprehensive Logging**: Winston-based logging with multiple transports
- **Request Tracking**: UUID-based request tracking and HTTP context management
- **Security**: Helmet.js security headers, XSS protection, and input sanitization

## Architecture

### Core Components

- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **Firebase Admin SDK**: Authentication and user management
- **Winston**: Structured logging
- **Morgan**: HTTP request logging

## Installation

### Prerequisites

- Node.js
- MongoDB
- Firebase project with Admin SDK credentials

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Memora-Tiberiusgh/backend
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Copy the provided `example.env` file to `.env` and configure with your values:

   ```bash
   cp example.env .env
   ```

   Then edit the `.env` file with your specific configuration values.

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Docker Development & Production

The application can be containerized for both development and production environments. The easiest way to run the complete Memora stack (backend, frontend, and database) is through the docker-compose file provided in the [orchestrator repository](https://github.com/Memora-Tiberiusgh/orchestrator):

**Using Docker Compose (Recommended):**

```bash
# Clone the orchestrator repository
git clone https://github.com/Memora-Tiberiusgh/orchestrator
cd orchestrator
# Follow the setup instructions in the orchestrator README
# This will start the entire Memora application stack
```

**Manual Docker Build (if needed):**

**Development Environment:**

```bash
docker build -f Dockerfile.dev -t memora-backend:dev .
docker run -p 8186:8186 memora-backend:dev
```

**Production Environment:**

```bash
docker build -f Dockerfile -t memora-backend:prod .
docker run -p 8186:8186 memora-backend:prod
```

## API Documentation

### Authentication

All protected routes require Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### User Endpoints

| Method | Endpoint                           | Description                       | Auth Required |
| ------ | ---------------------------------- | --------------------------------- | ------------- |
| POST   | `/users`                           | Create/retrieve user profile      | No            |
| PUT    | `/users/collections/:collectionId` | Toggle collection in user library | Yes           |

### Collection Endpoints

| Method | Endpoint                            | Description              | Auth Required |
| ------ | ----------------------------------- | ------------------------ | ------------- |
| GET    | `/collections`                      | Get user's collections   | Yes           |
| POST   | `/collections`                      | Create new collection    | Yes           |
| GET    | `/collections/public`               | Get public collections   | Yes           |
| GET    | `/collections/:collectionId`        | Get specific collection  | Yes           |
| PATCH  | `/collections/:collectionId`        | Update collection        | Yes           |
| DELETE | `/collections/:collectionId`        | Delete collection        | Yes           |
| POST   | `/collections/:collectionId/submit` | Submit for public review | Yes           |

### Flashcard Endpoints

| Method | Endpoint                                | Description                 | Auth Required |
| ------ | --------------------------------------- | --------------------------- | ------------- |
| POST   | `/flashcards`                           | Create new flashcard        | Yes           |
| GET    | `/flashcards/:flashcardId`              | Get specific flashcard      | Yes           |
| PATCH  | `/flashcards/:flashcardId`              | Update flashcard            | Yes           |
| DELETE | `/flashcards/:flashcardId`              | Delete flashcard            | Yes           |
| GET    | `/flashcards/collections/:collectionId` | Get collection's flashcards | Yes           |

### Request/Response Examples

**Create Collection:**

```json
POST /collections
{
  "name": "Spanish Vocabulary",
  "description": "Basic Spanish words and phrases"
}
```

**Create Flashcard:**

```json
POST /flashcards
{
  "question": "¿Cómo estás?",
  "answer": "How are you?",
  "collectionId": "64f7b1234567890abcdef123"
}
```

## Security Features

- **Input Sanitization**: XSS protection using the `xss` library
- **Authentication**: Firebase ID token verification
- **Authorization**: Role-based access control for collections and flashcards
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: Sanitized error responses in production
- **Request Tracking**: UUID-based request correlation

## Logging

The application uses Winston for comprehensive logging with multiple transports:

- **Console**: Formated logs for development
- **File Logging**: Separate files for combined, error, and exception logs
- **MongoDB**: Optional database logging for warnings and errors
- **Submission Tracking**: Dedicated logging for collection submissions

## Database Schema

### User Model

```javascript
{
  firebaseUid: String,      // Firebase UID (unique)
  displayName: String,      // User display name
  email: String,           // User email
  userAddedCollections: [ObjectId]  // References to added collections
}
```

### Collection Model

```javascript
{
  name: String,            // Collection name (1-50 characters)
  description: String,     // Optional description (max 500 characters)
  isPublic: Boolean,       // Public visibility flag
  creator: ObjectId,       // Reference to User
  submitted: Boolean       // Submission status for review
}
```

### Flashcard Model

```javascript
{
  question: String,        // Question text (1-500 characters)
  answer: String,         // Answer text (1-1000 characters)
  collectionId: ObjectId, // Reference to Collection
  creator: ObjectId       // Reference to User
}
```

## Development

### Code Style

This project uses ESLint with LNU configuration for consistent code formatting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and feature requests, please visit our [GitHub Discussions](https://github.com/orgs/Memora-Tiberiusgh/discussions) or contribute to the project at [GitHub organization](https://github.com/Memora-Tiberiusgh).

## Author

**Tiberius Gherac** - [tiberius.gherac@gmail.com](mailto:tiberius.gherac@gmail.com)  
First-year Web Development Student @ Linnaeus University  
GitHub: [@TiberiusGh](https://github.com/TiberiusGh)

---
