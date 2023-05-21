import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { UpdateUserDto, type AuthDto } from '../src/user/dto';
import { CreatePostDto, UpdatePostDto } from '../src/posts/dto';
import { CreateCommentDto, UpdateCommentDto } from '../src/comments/dto';

const dateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d*/;

describe('App E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }))
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleanDatabase();
    pactum.request.setBaseUrl('http://localhost:3000/api/v1');
  });

  afterAll(async () => {
    await app.close();
  });


  describe('User', () => {
    const dto: AuthDto = {
      email: 'admin@example.com',
      password: 'password',
    }
    describe('SignUp', () => {
      it("should sign up a user", async () => {
        return pactum.spec()
          .post('/users/sign_up')
          .withBody(dto)
          .expectStatus(201)
          .expectJsonLike({
            auth_token: /\w+/,
            user: {
              id: /\d+/,
              email: dto.email,
              role: 'USER',
              firstName: null,
              lastName: null,
            }
          })
      });
      it("should throw an error if the email is already taken", async () => {
        return pactum.spec()
          .post('/users/sign_up')
          .withBody(dto)
          .expectStatus(403)
          .expectJsonLike({
            statusCode: 403,
            message: 'Credentials are taken',
            error: 'Forbidden'
          })
      });
      it("should throw an error if email is empty", async () => {
        return pactum.spec()
          .post('/users/sign_up')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
          .expectJsonLike({
            statusCode: 400,
            message: [
              "email should not be empty",
              "email must be an email"
            ],
            error: "Bad Request"
          })
      });
      it("should throw an error if password is empty", async () => {
        return pactum.spec()
          .post('/users/sign_up')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
          .expectJsonLike({
            statusCode: 400,
            message: [
              "password should not be empty",
              "password must be a string"
            ],
            error: "Bad Request"
          })
      });
      it("should throw an error if password and email is empty", async () => {
        return pactum.spec()
          .post('/users/sign_up')
          .withBody({
          })
          .expectStatus(400)
          .expectJsonLike({
            statusCode: 400,
            message: [
              "email should not be empty",
              "email must be an email",
              "password should not be empty",
              "password must be a string"
            ],
            error: "Bad Request"
          })
      });
    });
    describe('SignIn', () => {
      it("should sign in a user", async () => {
        return pactum.spec()
          .post('/users/sign_in')
          .withBody(dto)
          .expectStatus(200)
          .expectJsonLike({
            auth_token: /\w+/,
            user: {
              id: /\d+/,
              email: dto.email,
              role: 'USER',
              firstName: null,
              lastName: null,
            }
          })
          .stores('userAT', 'auth_token')
      });
    });
    describe('Get Me', () => {
      it("should return the current user", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .get('/users/me')
          .expectStatus(200)
          .expectJsonLike({
            id: /\d+/,
            email: dto.email,
            role: 'USER',
            firstName: null,
            lastName: null,
            createdAt: dateRegex,
            updatedAt: dateRegex
          })
      });
    });

    describe('Update User', () => {
      it("should update a user", async () => {
        const updateUserDto: UpdateUserDto = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'jhon@example.com',
        }
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .patch('/users')
          .withBody(updateUserDto)
          .expectStatus(200)
          .expectJsonLike({
            id: /\d+/,
            email: updateUserDto.email,
            role: 'USER',
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            createdAt: dateRegex,
            updatedAt: dateRegex,
          })
      });
    });
  });

  describe('Post', () => {
    const firstPostDto: CreatePostDto = {
      title: 'My first post',
      content: 'This is my first post',
      slug: 'my-first-post',
    }
    const secondPostDto: CreatePostDto = {
      title: 'My second post',
      content: 'This is my second post',
      slug: 'my-second-post',
    }
    const thirdPostDto: CreatePostDto = {
      title: 'My third post',
      content: 'This is my third post',
      slug: 'my-second-post', // This slug is taken
    }

    describe('Create', () => {
      it("should create a post with status DRAFT", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .post('/posts')
          .withBody(firstPostDto)
          .expectStatus(201)
          .expectJsonLike({
            id: /\d+/,
            title: firstPostDto.title,
            content: firstPostDto.content,
            slug: firstPostDto.slug,
            createdAt: dateRegex,
            updatedAt: dateRegex,
            status: 'DRAFT',
          })
          .stores('unpublishedPostId', 'id')
      });
      it("should create a post with status PUBLISHED", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .post('/posts')
          .withBody({
            ...secondPostDto,
            status: 'PUBLISHED'
          })
          .expectStatus(201)
          .expectJsonLike({
            id: /\d+/,
            title: secondPostDto.title,
            content: secondPostDto.content,
            slug: secondPostDto.slug,
            createdAt: dateRegex,
            updatedAt: dateRegex,
            status: 'PUBLISHED',
          })
          .stores('publishedPostId', 'id')
      });
      it("should throw if slug is taken", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .post('/posts')
          .withBody(thirdPostDto)
          .expectStatus(403)
          .expectJsonLike({
            statusCode: 403,
            message: "Slug is taken. Please try another slug",
            error: "Forbidden"
          })
      });
    });

    describe('Get All PUBLISHED Posts', () => {
      it("should return a list of PUBLISHED posts", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .get('/posts')
          .expectStatus(200)
          .expectJsonLike([
            {
              id: /\d+/,
              title: secondPostDto.title,
              content: secondPostDto.content,
              slug: secondPostDto.slug,
              publishedAt: dateRegex,
            }
          ])
      });
    });
    describe('Get One PUBLISHED Post By Id', () => {
      it("should return a post", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .get('/posts/$S{publishedPostId}')
          .expectStatus(200)
          .expectJsonLike({
            id: /\d+/,
            title: secondPostDto.title,
            content: secondPostDto.content,
            slug: secondPostDto.slug,
            publishedAt: dateRegex,
          })
      });
    });
    describe('Update', () => {
      const updatePostDto: UpdatePostDto = {
        title: 'My updated post',
        content: 'This is my updated post',
        slug: 'my-updated-post',
      }
      it("should update a post", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .withBody(updatePostDto)
          .patch('/posts/$S{publishedPostId}')
          .expectStatus(200)
          .expectJsonLike({
            title: updatePostDto.title,
            content: updatePostDto.content,
            slug: updatePostDto.slug,
          })
      });
    });
    describe('Delete', () => {
      it("should delete a post", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .delete('/posts/$S{unpublishedPostId}')
          .expectStatus(200)
          .expectBody("Post deleted successfully")
      });
    });
  });

  describe('Comment', () => {
    const createCommentDto: CreateCommentDto = {
      content: 'This is my comment',
    }
    describe('Create', () => {
      it("should create a comment on post", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .withBody(createCommentDto)
          .post('/comments/$S{publishedPostId}')
          .expectStatus(201)
          .expectJsonLike({
            id: /\d+/,
            content: createCommentDto.content,
            createdAt: dateRegex,
            updatedAt: dateRegex,
            postId: /\d+/,
            userId: /\d+/,
          })
          .stores('commentId', 'id')
      });
    });
    describe('Get All', () => {
      it("should return a list of comments for a post", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .withBody(createCommentDto)
          .get('/comments/$S{publishedPostId}')
          .expectStatus(200)
          .expectJsonLike([
            {
              id: /\d+/,
              content: createCommentDto.content,
              createdAt: dateRegex,
              updatedAt: dateRegex,
              postId: /\d+/,
              userId: /\d+/,
            }
          ])
      });
    });
    // describe('Get One', () => {
    //   it.todo("should return a comment");
    // });
    describe('Update', () => {
      const updateCommentDto: UpdateCommentDto = {
        content: 'This is my updated comment',
      }
      it("should update a comment", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .withBody(updateCommentDto)
          .patch('/comments/$S{commentId}')
          .expectStatus(200)
          .expectJsonLike({
            id: /\d+/,
            content: updateCommentDto.content,
            createdAt: dateRegex,
            updatedAt: dateRegex,
            postId: /\d+/,
            userId: /\d+/,
          })
      });
    });
    describe('Delete', () => {
      it("should delete a comment", async () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: 'Bearer $S{userAT}'
          })
          .delete('/comments/$S{commentId}')
          .expectStatus(200)
          .expectBody("Comment deleted successfully")
      });
    });
  });
})