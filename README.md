# Nest.js Api Challenge

## Description

This is a simple API that allows you to make CRUD operations on a database. It was made using **Nest.js**, **Prisma ORM**, **Passport.js (JWT)** and **PostgreSQL**.

Consists of 4 main modules:

- **Auth**: Handles the authentication and authorization of the users using Passport.js and JWT.
- **Users**: Handles the CRUD operations of the users.
- **Posts**: Handles the CRUD operations of the posts.
- **Comments**: Handles the CRUD operations of the comments.

With the following routes:

- **Auth**: `/api/v1/users`
  - `POST /sign_up`
  - `POST /sign_in`
- **Users**: `/api/v1/users` _(protected)_
  - `GET /`
  - `GET /me` _Get the current user info_
  - `PATCH /` _Update the current user info_
  - `PATCH /change_password` _Change the current user password_
  - `PATCH /change_role` _Change the current user role (admin only)_
  - `DELETE /` _Delete the current user account_
- **Posts**: `/api/v1/posts` _(protected)_
  - `GET /` _All PUBLISHED posts_
  - `GET /:id` _Get a PUBLISHED post_
  - `POST /`
  - `PATCH /:id`
  - `DELETE /:id`
- **Comments**: `/api/v1/comments` _(protected)_
  - `GET /:postId` _Get all comments of a post_
  - `POST /:postId` _Create a comment on a post_
  - `PATCH /:id` _Update a comment_
  - `DELETE /:id` _Delete a comment_

With 2 types of E2E tests:

1. Using **Cucumber.js (Gherkin)**, **SuperTest** and **Chai**
1. Using **Jest** and **Pactum**

## Installation

```bash
$ npm install
```

## Running the app

```bash
# start the development database (docker)
$ docker-compose up -d dev-db

# migrate the database and seed it with data
$ npm run prisma:dev:deploy

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test 1

With Cucumber.js (Gherkin), SuperTest and Chai

```bash
$ npm run test:e2e:cucumber
```

## Test 2

With Jest and Pactum

```bash
$ npm run test:e2e:pactum
```
