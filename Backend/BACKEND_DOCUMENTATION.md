# Backend Technical Documentation - Advance Expense Tracker

This document provides a concise reference for every file, directory, service, model, and workflow within the `Backend` codebase.

---

## 1. Tech Stack Overview

- **Runtime & Language**: Node.js, TypeScript
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt password hashing
- **Audio & Speech-to-Text**: Vosk Engine (offline STT), `ffmpeg-static`, `fluent-ffmpeg`
- **OCR Engine**: Tesseract.js (`eng.traineddata`)
- **AI Extraction**: Google Gemini Generative AI (`@google/generative-ai`)
- **File Uploads**: Multer middleware

---

## 2. Directory & File Breakdown

### Entry Points (`src/`)
- **`server.ts`**: The application server bootstrap file. Connects to PostgreSQL via Sequelize, syncs database tables (`sequelize.sync`), and starts the Express server listening on the configured port.
- **`app.ts`**: Express application setup. Configures global middlewares (`express.json`, `cors`, logger), mounts API route endpoints under `/api`, and sets up global error handling.

---

### Configuration (`src/config/`)
- **`database.ts`**: Sequelize ORM instance setup connecting to PostgreSQL using host, port, database name, user, and password from environment variables.
- **`multer.ts`**: File upload configuration for Multer. Defines disk storage destinations in `src/uploads/` and validates allowed audio (`.mp3`, `.wav`, `.m4a`, etc.) and image file types with a 25MB limit.

---

### Models (`src/models/`)
- **`user.model.ts`**: Sequelize model defining the `Users` table (id, name, email, password, timestamps).
- **`category.model.ts`**: Sequelize model defining the `Categories` table (id, name, icon, color).
- **`expense.model.ts`**: Sequelize model defining the `Expenses` table (id, userId, categoryId, amount, type [expense/income], merchant, date, notes). Sets up relational associations (`Expense.belongsTo(User)`, `Expense.belongsTo(Category)`).

---

### Controllers (`src/controllers/`)
- **`auth.controller.ts`**: Handles user authentication HTTP requests (signup, login, token generation).
- **`user.controller.ts`**: Manages user profile fetching, updates, and account preferences.
- **`category.controller.ts`**: Handles HTTP endpoints for listing and creating expense categories.
- **`expense.controller.ts`**: Controls expense CRUD operations and AI extraction features:
  - `createExpense`, `getExpenses`, `updateExpense`, `deleteExpense`
  - `extractAudioExpense`: Receives uploaded audio file, transcribes speech via Vosk, parses structure via Gemini AI, and returns extracted expense details.
  - `extractImageExpense`: Receives receipt image, extracts text via OCR, parses structure via Gemini AI, and returns extracted expense details.

---

### Services (`src/services/`)
- **`user.service.ts`**: Business logic for querying and creating user records in the database.
- **`category.service.ts`**: Business logic for managing category records.
- **`expense.service.ts`**: Business logic for database queries related to expenses (filtering, aggregations, CRUD).
- **`vosk.service.ts`**: Offline Speech-to-Text service. Auto-downloads the Vosk English model (`vosk-model-small-en-us-0.15`), uses FFmpeg to convert incoming audio to 16kHz 16-bit Mono PCM WAV, and transcribes audio to raw text.
- **`ocr.service.ts`**: Optical Character Recognition service utilizing Tesseract to extract readable text from uploaded receipt images.
- **`gemini.service.ts`**: Integrates with Google Gemini AI API to turn unstructured text (from Vosk speech-to-text or OCR receipt text) into formatted JSON containing `merchant`, `amount`, `category`, `type`, and `date`.

---

### Routes (`src/routes/`)
- **`user.route.ts`**: Mounts user authentication and profile routes under `/api/user`.
- **`category.route.ts`**: Mounts category management routes under `/api/category`.
- **`expense.route.ts`**: Mounts expense endpoints under `/api/expense` (including `/extract-audio` and `/extract-image` with Multer middleware).

---

### Middlewares (`src/middlewares/`)
- **`asyncHandler.ts`**: Utility wrapper for asynchronous route controllers to automatically catch promise rejections and pass them to Express `next()`.
- **`errorHandler.ts`**: Global Express error-handling middleware that catches app errors and formats consistent JSON error responses with status codes.
- **`logger.middleware.ts`**: Request logging middleware that logs incoming HTTP methods, URLs, response status, and execution times.

---

### Utilities (`src/utils/`)
- **`appError.ts`**: Custom `AppError` class extending Node's standard `Error` to append HTTP status codes and operational flags.
- **`comparePassword.ts`**: Helper functions for hashing passwords and comparing plain-text passwords with bcrypt hashes.
- **`jwtToken.ts`**: Utility for signing and verifying JWT tokens for user authentication.
- **`sendResponse.ts`**: Formatter helper for sending standardized API responses (`{ success: true, message, data }`).
- **`env.ts`**: Helper module to safely load and access environment variables.

---

## 3. Core Feature Workflows

### A. Voice Audio Expense Extraction Flow
1. Client sends a `POST /api/expense/extract-audio` request with an audio file (`multipart/form-data`).
2. **Multer Middleware** stores temporary audio in `src/uploads/`.
3. **Vosk Service** converts the audio file to 16kHz Mono WAV using **FFmpeg**, runs offline voice recognition, and returns raw transcribed text.
4. Temporary audio files are safely cleaned up (unlinked).
5. **Gemini Service** takes the raw text and queries Gemini AI to extract structured expense details (`amount`, `merchant`, `category`, `type`, `date`).
6. Controller returns structured JSON response to the client.

### B. Receipt Image OCR Extraction Flow
1. Client sends a `POST /api/expense/extract-image` request with a receipt photo (`multipart/form-data`).
2. **Multer Middleware** stores temporary image in `src/uploads/`.
3. **OCR Service** runs Tesseract OCR to read text printed on the receipt.
4. **Gemini Service** analyzes receipt text to identify total amount, store name, item date, and expense category.
5. Controller returns structured JSON response to the client.

---

## 4. Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Server listening port (default: 3000) |
| `DB_HOST` | PostgreSQL host address (e.g. `127.0.0.1` or RDS endpoint) |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key used for signing JWT tokens |
| `GEMINI_API_KEY` | Google Gemini AI API key for text parsing |

---
