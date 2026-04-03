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
