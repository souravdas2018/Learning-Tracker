# Postman Testing Guide - Update Module Progress API

## Overview
The `updateModuleProgress` API now automatically generates random progress and time_spent values based on the number of times a module has been updated.

**Endpoint:** `PUT /courses/modules/:moduleId/progress`

**No Request Body Required** - All values are generated automatically!

---

## Prerequisites

### 1. Start the Backend Server
```bash
cd backend
npm install  # if not already done
npm run dev
```
The server should be running on `http://localhost:{PORT}` (check your `.env` file for PORT, typically 3000 or 5000)

### 2. Get a JWT Token
You need to authenticate first to get a JWT token.

#### Option A: Signup (if you don't have an account)
**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:{PORT}/auth/signup`
- **Headers:** 
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890",
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```

**Response:** You'll get a token in the response

#### Option B: Login (if you already have an account)
**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:{PORT}/auth/login`
- **Headers:** 
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```

**Response:** You'll get a token in the response. Copy this token!

---

## Testing the Update Module Progress API

### Step 1: Get a Module ID

First, you need to know a valid `moduleId`. You can get this by:

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:{PORT}/courses/{courseId}/modules`
- **Headers:**
  ```
  Authorization: Bearer {your_token_here}
  Content-Type: application/json
  ```

**Response:** List of modules with their IDs. Copy one `moduleId` from the response.

**Alternative:** If you don't have a courseId, first get courses:
- **Method:** `GET`
- **URL:** `http://localhost:{PORT}/courses`
- **Headers:**
  ```
  Authorization: Bearer {your_token_here}
  ```

### Step 2: Test Update Module Progress

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:{PORT}/courses/modules/{moduleId}/progress`
  - Replace `{moduleId}` with the actual module ID (e.g., `123e4567-e89b-12d3-a456-426614174000`)
- **Headers:**
  ```
  Authorization: Bearer {your_token_here}
  Content-Type: application/json
  ```
- **Body:** 
  - **Leave it empty** or select "None"
  - The API no longer accepts `progress` and `time_spent` in the body

**Example URL:**
```
http://localhost:3000/courses/modules/123e4567-e89b-12d3-a456-426614174000/progress
```

### Step 3: Test Multiple Times (Recommended)

Call the same endpoint **5 times in a row** to see the progression:

**Expected Behavior:**

1. **First Call:**
   - Progress: Random between **10-30%**
   - Time spent: Random between **15-30 minutes**

2. **Second Call:**
   - Progress: Random between **30-50%**
   - Time spent: Random between **20-45 minutes** (accumulated)

3. **Third Call:**
   - Progress: Random between **50-70%**
   - Time spent: Random between **25-60 minutes** (accumulated)

4. **Fourth Call:**
   - Progress: Random between **70-85%**
   - Time spent: Random between **30-75 minutes** (accumulated)

5. **Fifth Call:**
   - Progress: Random between **85-100%**
   - Time spent: Random between **35-90 minutes** (accumulated)

6. **Sixth Call:**
   - Progress: **100%** (capped)
   - Time spent: Random between **40-100 minutes** (accumulated)

7. **Seventh Call (and beyond):**
   - **Error:** "Module progress is already at 100%"

---

## Expected Response Format

### Success Response:
```json
{
  "message": "Progress updated successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "module_id": "uuid",
    "progress": 45,
    "time_spent": 65,
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (100% reached):
```json
{
  "error": "Module progress is already at 100%"
}
```

### Error Response (Unauthorized):
```json
{
  "error": "Unauthorized"
}
```

### Error Response (Missing Token):
```json
{
  "error": "Token missing or invalid"
}
```

---

## Postman Collection Setup

### Create a New Request:

1. **Open Postman** and create a new request
2. **Method:** Select `PUT` from dropdown
3. **URL:** Enter `http://localhost:{PORT}/courses/modules/:moduleId/progress`
4. **Headers Tab:**
   - Add `Authorization` key with value `Bearer {your_token}`
   - Add `Content-Type` key with value `application/json`
5. **Body Tab:**
   - Select **"None"** or leave it empty
   - **DO NOT** send JSON body with `progress` and `time_spent` - the API generates these automatically!
6. **Click Send**

### Set Up Environment Variables (Recommended):

Create a Postman Environment to store:
- `base_url`: `http://localhost:3000` (or your PORT)
- `token`: Your JWT token (update after login)
- `moduleId`: Module ID to test

Then use in URL: `{{base_url}}/courses/modules/{{moduleId}}/progress`

And in Authorization header: `Bearer {{token}}`

---

## Quick Test Checklist

- [ ] Server is running
- [ ] User account exists (or signup completed)
- [ ] JWT token obtained from login
- [ ] Module ID obtained from courses/modules endpoint
- [ ] Authorization header set with Bearer token
- [ ] Request body is empty/None
- [ ] First call returns progress 10-30%
- [ ] Second call returns progress 30-50%
- [ ] Third call returns progress 50-70%
- [ ] Fourth call returns progress 70-85%
- [ ] Fifth call returns progress 85-100%
- [ ] Sixth call returns 100% or error
- [ ] Time spent accumulates correctly

---

## Troubleshooting

### "Token missing or invalid"
- Make sure you copied the full token from login response
- Token might have expired - login again
- Check that Authorization header format is: `Bearer {token}` (with space after Bearer)

### "Module progress is already at 100%"
- The module has reached maximum progress
- To test again, you need a different module or reset the database

### "Unauthorized"
- Token is invalid or expired
- Login again to get a new token

### Connection Refused
- Server is not running
- Check PORT in .env matches the URL
- Verify server is listening on the correct port

### Module Not Found
- Invalid moduleId
- Get a valid moduleId from the `/courses/{courseId}/modules` endpoint

---

## Example Postman Request Screenshot Setup

**URL:**
```
PUT http://localhost:3000/courses/modules/550e8400-e29b-41d4-a716-446655440000/progress
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body:** (None/Empty)

---

Happy Testing! 🚀
