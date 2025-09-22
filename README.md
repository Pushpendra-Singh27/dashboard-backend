# Dashboard Backend API

A Node.js/Express backend API for managing clients and their assigned projects.

## Features

- Client management with project assignments
- Project tracking with expiry dates and renewal costs
- RESTful API endpoints for client project data
- MongoDB integration with Mongoose ODM
- Comprehensive project statistics and analytics

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your MongoDB connection string:
   ```
   MONGOURL=mongodb://localhost:27017/dashboard
   PORT=3000
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev  # Development mode with nodemon
   npm start    # Production mode
   ```

## API Endpoints

### Admin Management APIs

#### Add New Client
```
POST /api/admin/clients
```
Creates a new client with auto-generated client ID.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "client": {
      "clientId": "CLI0001",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Generate Unique Client ID
```
PUT /api/admin/clients/:clientId/generate-id
```
Generates and assigns a new unique client ID to an existing client.

**Response:**
```json
{
  "success": true,
  "message": "Client ID generated and updated successfully",
  "data": {
    "client": {
      "clientId": "CLI0001ABC",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "oldClientId": "CLI0001",
    "newClientId": "CLI0001ABC"
  }
}
```

#### Add Project to Client
```
POST /api/admin/clients/:clientId/projects
```
Creates a new project and assigns it to a specific client using project ID as primary key.

**Request Body:**
```json
{
  "name": "E-commerce Website",
  "description": "Full-featured online store with payment integration",
  "expiryDate": "2024-12-31T00:00:00.000Z",
  "renewalCost": 15000,
  "projectId": "PROJ001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created and assigned to client successfully",
  "data": {
    "project": {
      "projectId": "PROJ001",
      "name": "E-commerce Website",
      "description": "Full-featured online store with payment integration",
      "status": "active",
      "expiryDate": "2024-12-31T00:00:00.000Z",
      "renewalCost": 15000,
      "daysUntilExpiry": 365,
      "assignedTo": {
        "clientId": "CLI0001",
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    "clientInfo": {
      "clientId": "CLI0001",
      "name": "John Doe",
      "totalProjects": 1
    }
  }
}
```

#### Get All Clients
```
GET /api/admin/clients
```
Returns all clients with project statistics.

#### Get All Projects
```
GET /api/admin/projects
```
Returns all projects with client information.

### Client Authentication APIs

#### Client Login
```
POST /api/client/login
```
Authenticates client using either client ID or email with password.

**Request Body (Login with Client ID):**
```json
{
  "identifier": "CLI0001",
  "password": "password123"
}
```

**Request Body (Login with Email):**
```json
{
  "identifier": "client@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client login successful",
  "data": {
    "client": {
      "clientId": "CLI0001",
      "name": "John Doe",
      "email": "john@example.com",
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "isActive": true,
      "projectCount": 3
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### Client Logout
```
POST /api/client/logout
```
Logs out the client (client-side token removal).

### Client Project Management

#### Get All Projects for a Client
```
GET /api/client/:clientId/projects
```
Returns all projects assigned to a specific client with detailed information.

**Response:**
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "client": {
      "clientId": "CLI0001",
      "name": "John Doe",
      "email": "john@example.com",
      "projectCount": 2
    },
    "projects": [
      {
        "projectId": "PRJ0001",
        "name": "Website Development",
        "description": "Modern responsive website",
        "status": "active",
        "startDate": "2024-01-01T00:00:00.000Z",
        "expiryDate": "2024-12-31T00:00:00.000Z",
        "renewalCost": 5000,
        "daysUntilExpiry": 45,
        "isExpired": false,
        "renewalHistory": []
      }
    ]
  }
}
```

#### Get Client Profile with Project Summary
```
GET /api/client/:clientId/profile
```
Returns client profile information with project statistics.

**Response:**
```json
{
  "success": true,
  "message": "Client profile retrieved successfully",
  "data": {
    "client": {
      "clientId": "CLI0001",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "projectStats": {
      "total": 3,
      "active": 2,
      "expired": 0,
      "renewed": 1,
      "cancelled": 0
    },
    "expiringProjectsCount": 1,
    "expiringProjects": [
      {
        "projectId": "PRJ0001",
        "name": "Website Development",
        "expiryDate": "2024-12-31T00:00:00.000Z",
        "daysUntilExpiry": 45
      }
    ]
  }
}
```

#### Get Specific Project Details
```
GET /api/client/:clientId/projects/:projectId
```
Returns detailed information about a specific project assigned to a client.

**Response:**
```json
{
  "success": true,
  "message": "Project details retrieved successfully",
  "data": {
    "project": {
      "projectId": "PRJ0001",
      "name": "Website Development",
      "description": "Modern responsive website with CMS",
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "expiryDate": "2024-12-31T00:00:00.000Z",
      "renewalCost": 5000,
      "daysUntilExpiry": 45,
      "durationInDays": 365,
      "isExpired": false,
      "renewalHistory": [],
      "assignedTo": {
        "clientId": "CLI0001",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

### Health Check
```
GET /api/health
```
Returns server and database status.

## Data Models

### Client Model
- `name`: Client's full name
- `email`: Unique email address
- `password`: Hashed password
- `clientId`: Auto-generated unique client ID (CLI0001, CLI0002, etc.)
- `projects`: Array of project references
- `isActive`: Account status
- `lastLogin`: Last login timestamp

### Project Model
- `name`: Project name
- `assignedTo`: Reference to Client
- `description`: Project description
- `expiryDate`: Project expiry date
- `renewalCost`: Cost for renewal
- `projectId`: Auto-generated unique project ID (PRJ0001, PRJ0002, etc.)
- `status`: active, expired, renewed, cancelled
- `startDate`: Project start date
- `renewalHistory`: Array of renewal records

## Testing

### Client API Testing
To create sample data for testing client APIs:

```bash
node test-client-api.js
```

This will create sample clients and projects that you can use to test the client API endpoints.

### Client Login Testing
To see client login API documentation and examples:

```bash
node test-client-login.js
```

This will display comprehensive information about client login endpoints and sample requests.

### Admin API Testing
To see admin API documentation and sample requests:

```bash
node test-admin-api.js
```

This will display comprehensive information about admin API endpoints, request formats, and sample cURL commands.

### Manual Testing with cURL

#### Test Admin APIs:
```bash
# Add new client
curl -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","email":"test@example.com","password":"password123"}'

# Get all clients
curl -X GET http://localhost:3000/api/admin/clients

# Add project to client (replace CLI0001 with actual client ID)
curl -X POST http://localhost:3000/api/admin/clients/CLI0001/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"Test Description","expiryDate":"2024-12-31","renewalCost":5000}'

# Generate new client ID
curl -X PUT http://localhost:3000/api/admin/clients/CLI0001/generate-id

# Get all projects
curl -X GET http://localhost:3000/api/admin/projects
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Status Codes

- `200`: Success
- `404`: Resource not found
- `500`: Internal server error

## Environment Variables

- `MONGOURL`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
