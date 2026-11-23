
## API Docummentation

## Tech Stack

- **Backend**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**:

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/legal-cases-backend.git
cd legal-cases-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/databasename"
EMAIL_USER="user@example.com"
EMAIL_PASS="password"=>This is An App Password with a 16-character code  Gmail generates specifically for allowing external apps (like Nodemailer package as i use it for email sending) to access my Gmail account securely. It’s not  real Gmail password of gmail Account.

JWT_SECRET="your secret key"
```

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev --name migration name
```

### 5. Start the Server

```bash
npm run start:dev
```

# User API

## Overview

This API provides functionality for managing users and creating their roles, including creating users with a strong password and ensuring uniqueness for email and phone number fields. Upon successful user creation, a default password is sent to the user via email, and the user is required to reset their password upon first login.

### Password munipilation

### Create Role

## <<<<<<< HEAD

## Features

- Change Password
- Change Password before expired
- Reset Password

---

Create Role folder Structure in project

```
src/
│
├── password/
│   ├── dtos/
│   │   └── ChangePasswordDto.ts
|   ├── password.module.ts
│   ├── password.controller.ts
│   ├── password.service.ts
│
├── database/
│   └── database.service.ts
```

- **URL**: `PATCH http://localhost:3000/password/change`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:

**Description**: It will help change user default password .

```json
{
  "email": "user@example.com",
  "old_password": "OldPassword123!",
  "new_password": "NewPassword456!",
  "confirm_new_password": "NewPassword456!"
}
```

#### Response:

### 1.**Password changed successfully**

```json
{
  "message": "Password changed successfully"
}
```

#### Wrong Response:

### 2.**Wrong Password**

In case of user enter wrong password

```json
{
  "message": "Old password is incorrect",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 3.**when password does not march**

In case of user enter new password that are not some as confirm password

```json
{
  "message": "New passwords do not match",
  "error": "Bad Request",
  "statusCode": 400
}
```

```

```

---

---

### 3.2. **Get All Roles API**

### Endpoint

`GET http://localhost:3000/roles/all`

### Description

This endpoint Get all Roles from database
But to access This Api you must Authenticated as admin

```

```

### Status Codes

- `200 OK` - [List of Roles].

---

```

```

### 2. **Change Password before**

- **Endpoint**: `PATCH http://localhost:3000/password/change-before-expire`

- **Description**: It will help change user defined password of user before being expired.

Create User folder structure in project

```
src/
│
├── password/
│   ├── dtos/
│   │   └── ChangePasswordDto.ts
|   ├── password.module.ts
│   ├── password.controller.ts
│   ├── password.service.ts
│
├── database/
│   └── database.service.ts
```

#### Request Body

```json
{
  "email": "user@example.com",
  "old_password": "OldPassword123!",
  "new_password": "NewPassword456!",
  "confirm_new_password": "NewPassword456!"
}
```

#### Response

If the password is reseted successfully, the response will be:

```json
{
  "message": "Password reset successfully and sent to user email"
}
```

In case of wrong password the response will return an error message:

```json
{
  "message": "Old password is incorrect",
  "error": "Bad Request",
  "statusCode": 400
}
```

In case of wrong password the response will return an error message:

```json
{
  "message": "New passwords do not match",
  "error": "Bad Request",
  "statusCode": 400
}
```

```

```

```
---

```

### 3.1 **Reset Password**

- **Endpoint**: `POST http://localhost:3000/password/reset`

- **Description**: Reset user password with a strong randomly generated password. The system ensures that the email and phone number are unique in the database. If any of them already exist, a conflict error will be returned.
  This happen when user forget or his password expired admin should reset his/her password.

Create User folder structure in project

```
src/
│
├── password/
│   ├── dtos/
│   │   └── ChangePasswordDto.ts
|   ├── password.module.ts
│   ├── password.controller.ts
│   ├── password.service.ts
│
├── database/
│   └── database.service.ts
```

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response

If the password is reseted successfully, the response will be:

```json
{
  "message": "Password reset successfully and sent to user email"
}
```

In case of wrong Email the response will return an error message:

```json
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

```
---
```

### 3.2 **Reset Admin Password**

- **Endpoint**: `POST http://localhost:3000/password/reset-password`

- **Description**: Reset admin password with a strong password that should be differ from current one. The system ensures that the email and phone number are unique in the database. If any of them already exist, a conflict error will be returned.
  This happen when user forget or his password expired admin should reset his/her password.

Create User folder structure in project

```
src/
│
├── password/
│   ├── dtos/
│   │   └── ChangePasswordDto.ts
|   ├── password.module.ts
│   ├── password.controller.ts
│   ├── password.service.ts
│
├── database/
│   └── database.service.ts
```

#### Request Body

```json
{
  "email": "admin@example.com",
  "old_password": "currentPassword123",
  "new_password": "newSecurePassword456",
  "confirm_new_password": "newSecurePassword456"
}
```

#### Response

If the password is reseted successfully, the response will be:

```json
{
  "message": "Password reset successfully and sent to user email"
}
```

In case of wrong Email the response will return an error message:

```json
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

```json
{
  "email": "admin@example.com",
  "old_password": "currentPassword123",
  "new_password": "newSecurePassword456",
  "confirm_new_password": "differentPassword789"
}
```

In case of new password are not same the response will return an error message:

```json
{
  "message": "New passwords do not match"
}
```

```json
{
  "email": "admin@example.com",
  "old_password": "currentPassword123",
  "new_password": "currentPassword123",
  "confirm_new_password": "currentPassword123"
}
```

In case of new password and old password are same the response will return an error message:

```json
{
  "message": "New password cannot be the same as old password"
}
```

### 3.1.2. **Generate Strong Password**

- **Functionality**:
  - A strong password is generated automatically when creating a new user.
  - The password is composed of a combination of lowercase letters, uppercase letters, digits, and special characters.

#### Example Password Format

```text
zA3$hB7!
```

This password is sent to the user via email after the user is created. The user will need to reset their password during their first login.

---

- **Unique Fields**: Both the email and phone number are required to be unique. If either is already in use, a conflict error will be returned.

- **Security**: All passwords are hashed using `bcrypt` to ensure security. The generated passwords are strong enough to prevent common attacks.

---

### 4. **Authentication API**

This is detailed information on the `login` and `verifyOtp` API endpoints used for authentication and verification of One-Time Passwords (OTP) in the system.

```

---

---

```

### 5.1. **Login API**

- **Endpoint**: `POST http://localhost:3000/auth/login`

### Description

This endpoint allows users to log in using their email and password. Upon successful login, an OTP will be sent to the user's email address. The user will need to verify this OTP to complete the login process.

Authentication folder structure in project

```
src/
│
├── auth/
│   ├── middlewares/
│   │   ├── jwt-auth.guard.ts
|   |   ├── jwt.strategy.ts
|   |   ├── roles.decorator.ts
|   |   ├── roles.guard.ts
|   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│
├── database/
│   └── database.service.ts
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "userPassword"
}
```

### Response

```json
{
  "message": "OTP sent to email"
}

### Status Codes

- `200 OK` - OTP sent successfully.
- `401 Unauthorized` - Invalid credentials.

```

---

---

```

```

### 5.2. **Verify OTP API**

### Endpoint

`POST http://localhost:3000/auth/verify-otp`

### Description

This endpoint verifies the OTP sent to the user's email. If the OTP is valid and not expired, the user will be authenticated, and an access token will be generated. If the `mustResetPassword` flag is `true`, the user will be prompted to reset their password., before token is generated

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
  "access_token": "your-jwt-token",
  "message": "OTP verified successfully",
  "mustResetPassword": false
}
```

### Status Codes

- `200 OK` - OTP verified successfully.
- `401 Unauthorized` - Invalid or expired OTP.

### Redirect to Password Reset

If the `mustResetPassword` flag is `true`, the frontend should redirect the user to the password reset page.

Example Response for `mustResetPassword`:

```json
{
  "message": "Your password is default. Please reset it before it expires.",
  "resetPassword": true
}
```

---

### 3.2. **Verify OTP API**

### Endpoint

`POST http://localhost:3000/auth/resend-otp`

### Description

This endpoint also come and Resend the OTP resent to email in case they don't receive any code on email.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "userPassword"
}
```

### 6. OTP Verification with Password Reset Required

### Response

````
### Response


```json
{
  "message": "OTP resent successfully"
}
````

### Status Codes

- `200 OK` - OTP sent successfully.
- `401 Unauthorized` - Invalid credentials.

---

```

```

---

## Error Codes

### 1. Invalid Credentials

```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### 2. Invalid or Expired OTP

```json
{
  "statusCode": 401,
  "message": "Invalid or expired OTP"
}
```

### 3. Forbidden Access

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

---

## License

free to use and modify.

---

```

```

---

### 3.2. **Filter Active users API**

### Endpoint

`GET http://localhost:3000/users/active`

### Description

This endpoint filters all users where is_Active is equal to True
and get the list of all users but to access it you must have role of admin

```

```

### Status Codes

- `200 OK` - [List of Active Users].

---

```

```

=======

> > > > > > > CaseManagement

## License

free to use and modify.

---

## Author


=======
Created by Bergerac
=======

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A backend API for legal cases management built with <a href="http://nestjs.com/" target="_blank">NestJS</a> framework.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
</p>

## Description

Legal Cases Backend is a REST API built with NestJS for managing legal cases and related entities. It provides:

- User management system
- Database integration via Prisma ORM
- Modular architecture
- Complete test coverage

## Features

- **RESTful API** following best practices
- **User Management** with authentication and authorization
- **Database Integration** using Prisma ORM
- **TypeScript** for type safety
- **Testing** with Jest (unit and e2e tests)

## Installation

```bash
# Install dependencies
$ npm install

# Set up database (Prisma)
$ npx prisma generate
$ npx prisma migrate dev
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/legal_cases_db"
PORT=3000
```

## Running the App

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Database

This project uses Prisma ORM. To interact with the database:

```bash
# Run migrations
$ npx prisma migrate dev

# Open Prisma Studio (GUI)
$ npx prisma studio
```

## API Documentation

The API follows REST conventions. Available endpoints include:

- `GET /users` - List all users
- `POST /users` - Create new user
- More endpoints documented in the source code

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

For issues or questions, please open an issue in the repository.

## License

## Remember to user your own username and password for your database


=======
# Legal-case

