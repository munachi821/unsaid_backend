# The Unsaid - Backend REST API Specification

This document defines the complete backend architecture, API routes, data models, request/response formats, security specifications, and middleware requirements for **The Unsaid** anonymous messaging platform.

---

## 1. Architecture Overview & Base Conventions

- **Base URL**: `/api/v1` (or `/api`)

- **Data Format**: `application/json` (except image uploads which use `multipart/form-data`)

- **Authentication**: JWT token transmitted via `Authorization: Bearer <token>` header or Secure `HttpOnly` cookie (`access_token`).

- **Standard Response Structure**:

```json
{
  "success": true,

  "message": "Optional human-readable status message",

  "data": {}
}
```

- **Standard Error Response**:

```json
{
  "success": false,

  "error": {
    "code": "VALIDATION_ERROR",

    "message": "Invalid email address format",

    "details": {}
  }
}
```

---

## 2. Authentication & Authorization Routes (`/api/auth`)

### 2.1 Register User

- **Method**: `POST`

- **Path**: `/api/auth/signup`

- **Access**: Public

- **Request Body**:

```json
{
  "username": "munachi",

  "email": "user@example.com",

  "password": "SecurePassword123"
}
```

- **Validation**:

- `username`: Required, 3–30 characters, alphanumeric + underscores only.

- `email`: Required, valid email format, unique.

- `password`: Required, minimum 6 characters.

- **Success Response (`201 Created`)**:

```json
{
  "success": true,

  "message": "User registered successfully",

  "data": {
    "user": {
      "id": "usr_94a0f3e",

      "username": "munachi",

      "email": "user@example.com",

      "role": "user"
    },

    "token": "eyJhbGciOi..."
  }
}
```

### 2.2 Login User

- **Method**: `POST`

- **Path**: `/api/auth/login`

- **Access**: Public

- **Request Body**:

```json
{
  "email": "user@example.com",

  "password": "SecurePassword123"
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Login successful",

  "data": {
    "user": {
      "id": "usr_94a0f3e",

      "username": "munachi",

      "email": "user@example.com",

      "role": "user"
    },

    "token": "eyJhbGciOi..."
  }
}
```

### 2.3 Get Current User Session

- **Method**: `GET`

- **Path**: `/api/auth/me`

- **Access**: Protected (`RequireAuth`)

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "user": {
      "id": "usr_94a0f3e",

      "username": "munachi",

      "email": "user@example.com",

      "role": "user",

      "preferences": {
        "emailNotifications": true,

        "allowImages": true
      },

      "createdAt": "2026-08-26T12:00:00Z"
    }
  }
}
```

### 2.4 Logout User

- **Method**: `POST`

- **Path**: `/api/auth/logout`

- **Access**: Protected

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Logged out successfully"
}
```

### 2.5 Request Password Reset

- **Method**: `POST`

- **Path**: `/api/auth/forgot-password`

- **Access**: Public

- **Request Body**:

```json
{
  "email": "user@example.com"
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "If that email exists in our system, a password reset link has been sent."
}
```

### 2.6 Reset Password with Token

- **Method**: `POST`

- **Path**: `/api/auth/reset-password`

- **Access**: Public

- **Request Body**:

```json
{
  "token": "reset_token_hex_string",

  "newPassword": "NewSecurePassword123"
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Password updated successfully"
}
```

---

## 3. User & Settings Routes (`/api/users`)

### 3.1 Fetch Public Profile

- **Method**: `GET`

- **Path**: `/api/users/public/:username`

- **Access**: Public

- **Description**: Validates that a user's shareable link `/send/:username` exists and is accepting messages.

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "username": "munachi",

    "acceptsMessages": true,

    "allowImages": true
  }
}
```

### 3.2 Check Username Availability

- **Method**: `GET`

- **Path**: `/api/users/check-username?username=desired_name`

- **Access**: Protected

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "username": "desired_name",

    "available": true
  }
}
```

### 3.3 Update Username

- **Method**: `PATCH`

- **Path**: `/api/users/me/username`

- **Access**: Protected

- **Request Body**:

```json
{
  "username": "new_username"
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Username updated successfully",

  "data": {
    "username": "new_username"
  }
}
```

### 3.4 Change Password

- **Method**: `PATCH`

- **Path**: `/api/users/me/password`

- **Access**: Protected

- **Request Body**:

```json
{
  "currentPassword": "OldPassword123",

  "newPassword": "NewPassword456"
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Password changed successfully"
}
```

// add the allow-images col to users database and email notif

### 3.5 Update Notification & Privacy Preferences

- **Method**: `PATCH`

- **Path**: `/api/users/me/preferences`

- **Access**: Protected

- **Request Body**:

```json
{
  "emailNotifications": true,

  "allowImages": true
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "preferences": {
      "emailNotifications": true,

      "allowImages": true
    }
  }
}
```

### 3.6 Export User Data

- **Method**: `GET`

- **Path**: `/api/users/me/export`

- **Access**: Protected

- **Description**: Returns all received messages and account data formatted as JSON or download stream.

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "user": { "username": "munachi", "email": "user@example.com" },

    "totalMessages": 42,

    "messages": [
      {
        "id": "msg_01",

        "mainMessage": "You're doing great!",

        "img": null,

        "createdAt": "2026-08-20T10:15:00Z"
      }
    ]
  }
}
```

### 3.7 Delete Account

- **Method**: `DELETE`

- **Path**: `/api/users/me`

- **Access**: Protected

- **Request Body**:

```json
{
  "password": "AccountPassword123"
}
```

- **Description**: Permanently wipes user record, preferences, and all associated messages/images.

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Account and all associated data permanently deleted"
}
```

---

## 4. Anonymous Message Submission (`/api/messages`)

### 4.1 Send Anonymous Message

- **Method**: `POST`

- **Path**: `/api/messages/send/:username`

- **Access**: Public _(Strict rate limit: 10 requests / 15 mins per IP)_

- **Content-Type**: `multipart/form-data`

- **Form Data Fields**:

- `message` (string, required if no image, max 250 characters)

- `img` (file, optional, max 2MB, allowed mimetypes: `image/jpeg`, `image/png`, `image/webp`, `image/gif`)

- **Validation**:

- Must provide either `message` or `img` (or both).

- Maximum character count: 250.

- Image size must not exceed 2MB.

- **Success Response (`201 Created`)**:

```json
{
  "success": true,

  "message": "Message sent anonymously!"
}
```

---

## 5. Inbox & Message Management Routes (`/api/messages`)

### 5.1 Get Active Inbox Messages

- **Method**: `GET`

- **Path**: `/api/messages/inbox`

- **Access**: Protected

- **Query Parameters**:

- `filter`: `"all"` | `"text"` | `"img"` (default: `"all"`)

- `page`: Integer (default: `1`)

- `limit`: Integer (default: `20`)

- **Description**: Returns non-archived messages (< 24 hours old or `isArchived = false`).

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "messages": [
      {
        "id": "msg_812739",

        "mainMessage": "Keep building amazing things!",

        "img": "https://res.cloudinary.com/.../image.webp",

        "isArchived": false,

        "createdAt": "2026-08-26T11:45:00Z",

        "date": "August 26th",

        "time": "11:45 GMT"
      }
    ],

    "pagination": {
      "total": 1,

      "page": 1,

      "totalPages": 1
    }
  }
}
```

### 5.2 Get Archived Messages

- **Method**: `GET`

- **Path**: `/api/messages/archived`

- **Access**: Protected

- **Query Parameters**:

- `filter`: `"all"` | `"text"` | `"img"`

- `page`: Integer

- `limit`: Integer

- **Description**: Returns messages older than 24 hours or manually archived.

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "messages": [],

    "pagination": { "total": 0, "page": 1, "totalPages": 0 }
  }
}
```

### 5.3 Archive Message

- **Method**: `PATCH`

- **Path**: `/api/messages/:id/archive`

- **Access**: Protected

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Message moved to archive"
}
```

### 5.4 Unarchive Message

- **Method**: `PATCH`

- **Path**: `/api/messages/:id/unarchive`

- **Access**: Protected

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Message restored to inbox"
}
```

### 5.5 Delete Single Message

- **Method**: `DELETE`

- **Path**: `/api/messages/:id`

- **Access**: Protected

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Message deleted"
}
```

### 5.6 Clear All Messages

- **Method**: `DELETE`

- **Path**: `/api/messages/clear-all`

- **Access**: Protected

- **Request Body**:

```json
{
  "confirmation": true
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "All messages cleared successfully"
}
```

---

## 6. Admin Portal Routes (`/api/admin`)

_(All routes in this group require `RequireAuth` + `RequireAdmin` middleware)_

### 6.1 Platform Statistics

- **Method**: `GET`

- **Path**: `/api/admin/stats`

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "totalUsers": 1234,

    "totalMessages": 8940,

    "flaggedMessages": 12,

    "activeUsersLast24h": 340
  }
}
```

### 6.2 List Users

- **Method**: `GET`

- **Path**: `/api/admin/users`

- **Query Parameters**:

- `search`: string (username or email search)

- `status`: `"all"` | `"active"` | `"banned"`

- `page`: Integer

- `limit`: Integer

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "users": [
      {
        "id": "usr_94a0f3e",

        "username": "munachi",

        "email": "user@example.com",

        "status": "active",

        "messageCount": 24,

        "createdAt": "2026-08-01T00:00:00Z"
      }
    ],

    "pagination": { "total": 1, "page": 1, "totalPages": 1 }
  }
}
```

### 6.3 Update User Status (Ban / Unban)

- **Method**: `PATCH`

- **Path**: `/api/admin/users/:id/status`

- **Request Body**:

```json
{
  "status": "banned"
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "User status updated to banned"
}
```

### 6.4 Delete User (Admin Purge)

- **Method**: `DELETE`

- **Path**: `/api/admin/users/:id`

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "User and records permanently purged"
}
```

### 6.5 Content Moderation Queue

- **Method**: `GET`

- **Path**: `/api/admin/moderation`

- **Query Parameters**: `?status=pending|reviewed`

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "flaggedMessages": [
      {
        "id": "msg_99",

        "recipientUsername": "munachi",

        "mainMessage": "Offensive text example",

        "imageUrl": null,

        "flagReason": "Abusive content",

        "createdAt": "2026-08-26T09:00:00Z"
      }
    ]
  }
}
```

### 6.6 Moderate / Delete Flagged Message

- **Method**: `DELETE`

- **Path**: `/api/admin/moderation/:id`

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "Flagged message removed"
}
```

### 6.7 Get System Settings

- **Method**: `GET`

- **Path**: `/api/admin/settings`

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "data": {
    "maxCharLimit": 250,

    "maxImageSizeMb": 2,

    "allowRegistration": true,

    "maintenanceMode": false
  }
}
```

### 6.8 Update System Settings

- **Method**: `PATCH`

- **Path**: `/api/admin/settings`

- **Request Body**:

```json
{
  "maxCharLimit": 250,

  "maxImageSizeMb": 2,

  "allowRegistration": true,

  "maintenanceMode": false
}
```

- **Success Response (`200 OK`)**:

```json
{
  "success": true,

  "message": "System settings updated"
}
```

---

## 7. Database Entity Relationship & Schema

```

+--------------------------------------------------+

|                      USERS                       |

+--------------------------------------------------+

| id                  VARCHAR / UUID (PK)          |

| username            VARCHAR(30) UNIQUE INDEX     |

| email               VARCHAR(255) UNIQUE INDEX    |

| password_hash       VARCHAR(255)                 |

| role                ENUM('user', 'admin')        |

| status              ENUM('active', 'banned')     |

| email_notif         BOOLEAN DEFAULT TRUE         |

| allow_images        BOOLEAN DEFAULT TRUE         |

| created_at          TIMESTAMP                    |

| updated_at          TIMESTAMP                    |

+--------------------------------------------------+

                        | 1

                        |

                        | N

+--------------------------------------------------+

|                     MESSAGES                     |

+--------------------------------------------------+

| id                  VARCHAR / UUID (PK)          |

| recipient_id        VARCHAR / UUID (FK -> Users) |

| main_message        VARCHAR(250) NULL            |

| image_url           VARCHAR(500) NULL            |

| is_archived         BOOLEAN DEFAULT FALSE        |

| is_flagged          BOOLEAN DEFAULT FALSE        |

| created_at          TIMESTAMP (INDEX)            |

| updated_at          TIMESTAMP                    |

+--------------------------------------------------+

```

---

## 8. Essential Backend Middlewares & Services

1\. **`authMiddleware`**: Verifies JWT token from headers/cookies; attaches `req.user` to the request object.

2\. **`adminMiddleware`**: Checks if `req.user.role === 'admin'`.

3\. **`uploadMiddleware`**: Handles `multipart/form-data` uploads via `multer` (limits image size <= 2MB) and pushes to Cloudinary / AWS S3 / Supabase.

4\. **`rateLimiter`**:

- `send_message_limiter`: 10 requests / 15 mins per IP.

- `auth_limiter`: 5 login attempts / 15 mins per IP.

5\. **24-Hour Archive Cron Job**:

- Runs every hour or midnight.

- Query: `UPDATE messages SET is_archived = true WHERE is_archived = false AND created_at < NOW() - INTERVAL 24 HOUR;`
