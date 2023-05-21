import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { setDefaultTimeout } from '@cucumber/cucumber';
import { after, afterAll, before, beforeAll, binding, given, when } from 'cucumber-tsflow';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import Context from '../support/world';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuthDto } from '../../src/user/dto';
import { CreatePostDto } from 'src/posts/dto';
import { CreateCommentDto } from 'src/comments/dto';

setDefaultTimeout(60 * 1000);

@binding([Context])
export class requests {
  constructor(protected context: Context) { }

  @after()
  public async after(): Promise<void> {
    await this.context.app.close();
  }

  // @beforeAll()
  // public async beforeAll(): Promise<void> {
  // }

  @before()
  public async before(): Promise<void> {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(AppModule).useValue(AppModule).compile();
    this.context.app = moduleRef.createNestApplication();
    this.context.app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    this.context.app.setGlobalPrefix('api/v1');
    await this.context.app.init();
    this.context.prisma = await this.context.app.get(PrismaService);
    await this.context.prisma.cleanDatabase();
  }

  @when(/restart app/)
  public async restartApp(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.context.app = moduleFixture.createNestApplication();
    this.context.app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    this.context.app.setGlobalPrefix('api/v1');
    await this.context.app.init();
    this.context.prisma = await this.context.app.get(PrismaService);
    await this.context.prisma.cleanDatabase();
  }

  @given(/^Invalid auth token$/)
  public async invalidAuthorization() {
    this.context.auth_token = 'xxx';
  }

  @when(/remove auth token/)
  public removeAuth() {
    this.context.auth_token = null;
  }

  @given(/I Sign Up a new User/)
  public async signUpNewUser() {
    const dto: AuthDto = {
      email: 'admin@example.com',
      password: 'password',
    }
    const POST = request(this.context.app.getHttpServer()).post('/api/v1/users/sign_up');
    const newUser = await POST.send(dto);
    if (newUser.body.auth_token) {
      this.context.auth_token = newUser.body.auth_token;
    } else {
      this.context.auth_token = null;
    }
  }

  @given(/I Create a new Post/)
  public async createNewPost() {
    const dto: CreatePostDto = {
      title: 'title for post',
      content: 'content for post',
      slug: 'slug',
      status: 'PUBLISHED',
    }
    const POST = request(this.context.app.getHttpServer()).post('/api/v1/posts');
    if (this.context.auth_token) {
      POST.set('Authorization', 'Bearer ' + this.context.auth_token);
    }
    const newPost = await POST.send(dto);
    if (newPost.body.id) {
      this.context.post_id = newPost.body.id;
    } else {
      this.context.post_id = null;
    }
    this.context.response = newPost;
  }

  @given(/I Create a new Comment/)
  public async createNewComment() {
    const dto: CreateCommentDto = {
      content: 'content for comment',
    }
    const url = '/api/v1/comments/' + this.context.post_id
    const POST = request(this.context.app.getHttpServer()).post(url);
    if (this.context.auth_token) {
      POST.set('Authorization', 'Bearer ' + this.context.auth_token);
    }
    const newComment = await POST.send(dto);
    if (newComment.body.id) {
      this.context.comment_id = newComment.body.id;
    } else {
      this.context.comment_id = null;
    }
    this.context.response = newComment;
  }

  @given(/make a GET request to "([^"]*)"/)
  public async getRequest(url: string) {
    const GET = request(this.context.app.getHttpServer()).get(url);

    if (this.context.auth_token) {
      GET.set('Authorization', 'Bearer ' + this.context.auth_token);
    }
    this.context.response = await GET.send();
  }

  @given(/make a GET request to GET a POST by Id to "([^"]*)"/)
  public async getRequestToGetAPostById(url: string) {
    url = url + '/' + this.context.post_id;
    const GET = request(this.context.app.getHttpServer()).get(url);

    if (this.context.auth_token) {
      GET.set('Authorization', 'Bearer ' + this.context.auth_token);
    }
    this.context.response = await GET.send();
  }

  @given(/make a GET request to GET all COMMENTS for a POST Id to "([^"]*)"/)
  public async getRequestToGetAllCommentsForPostId(url: string) {
    url = url + '/' + this.context.post_id;
    const GET = request(this.context.app.getHttpServer()).get(url);

    if (this.context.auth_token) {
      GET.set('Authorization', 'Bearer ' + this.context.auth_token);
    }
    this.context.response = await GET.send();
  }

  @given(/make a POST request to "([^"]*)" with:/)
  public async postRequestWithBody(url: string, table: { rawTable: [] }) {
    const POST = request(this.context.app.getHttpServer()).post(url);
    const body = this.context.tableToObject(table);
    if (this.context.auth_token) {
      POST.set('Authorization', 'Bearer ' + this.context.auth_token);
    }
    this.context.response = await POST.send(body);
  }

  @given(/make a POST request to CREATE a POST to "([^"]*)" with:/)
  public async postRequestWithBodyToCreateAPost(url: string, table: { rawTable: [] }) {
    const POST = request(this.context.app.getHttpServer()).post(url);
    const body = this.context.tableToObject(table);
    if (this.context.auth_token) {
      POST.set('Authorization', 'Bearer ' + this.context.auth_token);
    }
    const response = await POST.send(body);
    console.log(response.body)
    this.context.response = response;
    this.context.post_id = response.body.id;
    console.log(this.context.post_id)
  }

  @when(/make a PATCH request to "([^"]*)" with:/)
  public async patchRequest(url: string, table: { rawTable: [] }) {

    const PATCH = request(this.context.app.getHttpServer()).patch(url);

    if (this.context.auth_token) {
      PATCH.set('Authorization', 'Bearer ' + this.context.auth_token);
    }

    this.context.response = await PATCH.send(this.context.tableToObject(table));
  }

  @when(/make a PATCH request to UPDATE a Post to "([^"]*)" with:/)
  public async patchRequestToUpdateAPost(url: string, table: { rawTable: [] }) {
    url = url + '/' + this.context.post_id;
    const PATCH = request(this.context.app.getHttpServer()).patch(url);

    if (this.context.auth_token) {
      PATCH.set('Authorization', 'Bearer ' + this.context.auth_token);
    }

    this.context.response = await PATCH.send(this.context.tableToObject(table));
  }

  @when(/make a PATCH request to UPDATE a Comment to "([^"]*)" with:/)
  public async patchRequestToUpdateAComment(url: string, table: { rawTable: [] }) {
    url = url + '/' + this.context.comment_id;
    const PATCH = request(this.context.app.getHttpServer()).patch(url);

    if (this.context.auth_token) {
      PATCH.set('Authorization', 'Bearer ' + this.context.auth_token);
    }

    this.context.response = await PATCH.send(this.context.tableToObject(table));
  }

  @when(/make a DELETE request to DELETE a Post to "([^"]*)"/)
  public async deletePostRequest(url: string) {
    url = url + '/' + this.context.post_id;
    const DELETE = request(this.context.app.getHttpServer()).delete(url);

    if (this.context.auth_token) {
      DELETE.set('Authorization', 'Bearer ' + this.context.auth_token);
    }

    this.context.response = await DELETE.send();
  }

  @when(/make a DELETE request to DELETE a Comment to "([^"]*)"/)
  public async deleteCommentRequest(url: string) {
    url = url + '/' + this.context.comment_id;
    const DELETE = request(this.context.app.getHttpServer()).delete(url);

    if (this.context.auth_token) {
      DELETE.set('Authorization', 'Bearer ' + this.context.auth_token);
    }

    this.context.response = await DELETE.send();
  }
}