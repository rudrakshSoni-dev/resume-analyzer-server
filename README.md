# 🔐 Authentication API Documentation

Base URL:

```
http://localhost:5000/api/v0/auth
```

---

# 📌 1. Register User

### Endpoint

```
POST /register
```

### Request Body

```json
{
  "name": "Rudraksh Soni",
  "email": "user@example.com",
  "password": "123456"
}
```

### Response

```json
{
  "message": "User registered. Please verify your email using OTP.",
  "user": {
    "id": "uuid",
    "name": "Rudraksh Soni",
    "email": "user@example.com"
  }
}
```

---

# 📌 2. Verify Email (OTP)

### Endpoint

```
POST /verify-email
```

### Request Body

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Response

```json
{
  "message": "Email verified successfully"
}
```

---

# 📌 3. Login

### Endpoint

```
POST /login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Response

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

# 📌 4. Logout

### Endpoint

```
POST /logout
```

### Request Body

```json
{}
```

### Response

```json
{
  "message": "Logout Successful"
}
```

---

# 🔁 PASSWORD RESET (OTP FLOW)

---

# 📌 5. Forgot Password (Send OTP)

### Endpoint

```
POST /forgot-password
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Response

```json
{
  "message": "OTP sent to email"
}
```

---

# 📌 6. Verify Reset OTP

### Endpoint

```
POST /verify-reset-otp
```

### Request Body

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Response

```json
{
  "message": "OTP verified",
  "userId": "uuid"
}
```

---

# 📌 7. Reset Password

### Endpoint

```
POST /reset-password
```

### Request Body

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "newStrongPassword"
}
```

### Response

```json
{
  "message": "Password reset successful"
}
```

---

# ⚠️ Error Responses

### Validation Error

```json
{
  "message": "Validation error",
  "errors": [...]
}
```

### Common Errors

```json
{
  "message": "User not found"
}
```

```json
{
  "message": "Invalid OTP"
}
```

```json
{
  "message": "OTP expired"
}
```

```json
{
  "message": "Email already in use"
}
```

---

# 🔐 Notes

* OTP is **6-digit numeric**
* OTP expiry: **~10 minutes**
* Password is always **hashed (bcrypt)**
* OTP is **hashed before storing**
* Only one OTP per user (upsert)

---

# ✅ Recommended Improvements (Next)

* Add rate limiting (OTP spam protection)
* Add max OTP attempts
* Use Redis for OTP (faster)
* Remove `userId` exposure → use temporary token

---

# 🚀 Quick Test Flow

1. Register
2. Verify Email (OTP)
3. Login
4. Forgot Password
5. Verify Reset OTP
6. Reset Password

---

# 🧠 Status

✔ Fully working auth system
✔ OTP-based verification
✔ Secure password reset
✔ Prisma + PostgreSQL integrated

---

# 📄 Resume APIs

---

# 📌 1. Upload Resume

### Endpoint

```bash
POST /upload
```

### Request (Form Data)

| Key    | Type | Description     |
| ------ | ---- | --------------- |
| resume | File | PDF file (.pdf) |

⚠️ Content-Type: `multipart/form-data`

---

### Response

```json
{
  "id": "1819d895-b9e0-4940-ae9c-5c48f1dffa06",
  "userId": "4727014c-a492-45f1-99c7-244e44ea8152",
  "fileUrl": "https://res.cloudinary.com/.../resume.pdf",
  "mimetype": "application/pdf",
  "parsedText": "Extracted resume text...",
  "atsScore": null,
  "createdAt": "2026-04-03T12:02:54.952Z"
}
```

---

# 📌 2. Get All Resumes

### Endpoint

```bash
GET /
```

### Description

Fetch all resumes for the logged-in user.

---

### Response

```json
[
  {
    "id": "resume_id",
    "fileUrl": "https://...",
    "createdAt": "2026-04-03T12:02:54.952Z"
  }
]
```

---

# 📌 3. Get Resume by ID

### Endpoint

```bash
GET /:id
```

### Params

| Param | Type   | Description |
| ----- | ------ | ----------- |
| id    | string | Resume ID   |

---

### Response

```json
{
  "id": "resume_id",
  "fileUrl": "https://...",
  "parsedText": "Full extracted text...",
  "createdAt": "2026-04-03T12:02:54.952Z"
}
```

---

# 📌 4. Analyze Resume

### Endpoint

```bash
POST /:id/analyze
```

### Request Body (Optional)

```json
{
  "jobDescription": "Optional job description text"
}
```

---

### Response

```json
{
  "message": "Resume analyzed successfully",
  "analysis": {
    "id": "analysis_id",
    "resumeId": "resume_id",
    "atsScore": 62.76,
    "keywordScore": 50,
    "sectionScore": 100,
    "skillScore": 47.06,
    "structureScore": 100,
    "semanticScore": 0,
    "experienceScore": 92,
    "impactScore": 95,
    "suggestions": {
      "rewriteTips": [
        "Use action verbs",
        "Quantify achievements"
      ],
      "suggestions": [
        "Fix formatting issues",
        "Improve structure"
      ],
      "missingKeywords": [
        "Cloud Computing",
        "DevOps Tools"
      ]
    },
    "createdAt": "2026-04-03T12:07:53.290Z"
  }
}
```

---

# ⚠️ Notes

* Only **PDF files** are supported
* File is uploaded to **Cloudinary**
* Resume text is **auto-parsed**
* Analysis uses **LLM-based scoring**
* `jobDescription` is optional but improves results

---

# 🔐 Middleware Used

* `upload.single("resume")` → file upload (Multer)
* `validateUploadResume` → input validation
* `handleValidationErrors` → error handler

---

# 🚀 Flow

1. Upload Resume
2. Store + Parse
3. Fetch Resume
4. Analyze Resume

---

# 🧠 Status

✔ Resume upload working
✔ Cloud storage integrated
✔ Text extraction working
✔ AI analysis working

---
