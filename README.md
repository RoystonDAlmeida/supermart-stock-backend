# Supermarket Stock Management - Backend

This repository contains the backend API for the Supermarket Stock Management application. It provides the server-side logic for managing users, products, sales, and stock levels using Node.js, Express, and MongoDB.

## Table of Contents

- [Supermarket Stock Management - Backend](#supermarket-stock-management---backend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Running the Server](#running-the-server)
    - [Authentication](#authentication)
    - [User Roles \& Permissions](#user-roles--permissions)
    - [Error Handling](#error-handling)

## Features

*   **User Authentication:** Secure user registration and login functionality using JSON Web Tokens (JWT).
*   **Role-Based Access Control:** Differentiates user capabilities based on assigned roles (manager, staff, cashier).
*   **Product Management:** Allows authorized users to perform Create, Read, Update, and Delete (CRUD) operations on products.
*   **Sales Recording:** Enables users to record sales transactions, which automatically updates product stock levels.
*   **Stock Overview:** Provides a summary of stock levels, sales figures, and revenue, including identification of low-stock and out-of-stock items.
*   **Health Check:** Includes a basic endpoint to verify server status and database connectivity.

## Technologies Used

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **MongoDB:** NoSQL database for data persistence.
*   **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js.
*   **jsonwebtoken (JWT):** Used for generating and verifying authentication tokens.
*   **bcryptjs (Implied):** Used for securely hashing user passwords (within the User model).
*   **cors:** Middleware to enable Cross-Origin Resource Sharing for frontend integration.
*   **dotenv:** Loads environment variables from a `.env` file into `process.env`.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** Version 14.x or later is recommended. Download from nodejs.org.
*   **npm** or **yarn:** Node.js package manager (usually included with Node.js).
*   **MongoDB:** A running MongoDB instance. This can be a local installation or a cloud-based service like MongoDB Atlas. Using local MongoDB or MongoDB Atlas is fine.

## Getting Started

Follow these steps to get the backend server running.

### Installation

1.  **Clone the repository:**
    ```bash
    git@github.com:RoystonDAlmeida/supermart-stock-backend.git
    cd supermart-stock-backend/
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or if you use yarn:
    ```bash
    yarn install
    ```

### Environment Variables

Create a file named `.env` in the `supermart-stockbackend` root directory. Add the following environment variables, replacing the placeholder values with your actual configuration:

```dotenv
# Server Configuration
PORT=5000 # The port the server will listen on

# MongoDB Connection
MONGODB_URI = <your_mongodb_connection_string> # Your MongoDB connection string

# JWT Configuration
JWT_SECRET = <your_very_secure_and_random_jwt_secret_key> # A strong, unique secret for signing tokens

# Frontend URL (for CORS)
FRONTEND_URL = <Deployed_frontend_url or localhost_frontend_url>
```

### Running the Server
1. Start the server:
```bash
npm start
```

Alternatively, you can run it directly with node:
```bash
node server.js
```

The server will start, attempt to connect to MongoDB, and listen on the port specified in your .env file . You should see console messages indicating the connection status and the listening port.

### Authentication
This API secures most routes using JSON Web Tokens (JWT).

1. Users must first register or log in via the /auth/register or /auth/login endpoints, respectively.
2. Upon successful authentication, the API returns a JWT token.
3. For subsequent requests to protected routes, this token must be included in the Authorization header using the Bearer scheme:
```bash
Authorization: Bearer <your_jwt_token>
```
4. The authenticate middleware intercepts requests to protected routes, verifies the token's validity and expiry, and attaches the user's information (id, username, role) to the req.user object for use in downstream handlers. Tokens are configured to expire after 24 hours.

### User Roles & Permissions
The application implements role-based access control with the following roles:

* **cashier (Default)**: Can log in, view products, record sales, view sales history, and view their own stock summary (as currently implemented in stock.js).
* **staff**: Inherits all cashier permissions. Additionally, can create and update products.
* **manager**: Inherits all staff permissions. Additionally, can delete products.

Permissions are enforced within specific route handlers by checking the req.user.role property.

### Error Handling
* The API uses standard HTTP status codes to indicate request outcomes (e.g., 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
* Error responses typically include a JSON body with a message field describing the error.
* A global error handling middleware is defined in server.js. It catches unhandled errors that occur during request processing, logs the error stack trace to the console, and sends a generic 500 Internal Server Error response to the client.