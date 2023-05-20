import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post, PostStatus, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  // (Helper function) Get a single post by id and include the user id
  async getPostById(id: number): Promise<Post & { user: { id: number } }> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { user: { select: { id: true } } },
    });
    if (!post) {
      throw new ForbiddenException('Post not found');
    }
    return post;
  }

  // Get all posts that are published
  getAllPosts(): Promise<Omit<Post, "status" | "createdAt" | "updatedAt" | "userId">[]> {
    return this.prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        publishedAt: true,
      },
    });
  }

  // Create a new post
  async createPost(dto: CreatePostDto, user: User): Promise<Post> {
    try {
      const newPost = await this.prisma.post.create({
        data: {
          title: dto.title,
          content: dto.content,
          status: dto.status || PostStatus.DRAFT,
          slug: dto.slug,
          user: { connect: { id: user.id } },
          ...(dto.status === PostStatus.PUBLISHED && { publishedAt: new Date() }),
        },
      });
      return newPost;
    } catch (error) {
      if (error.constructor.name === PrismaClientKnownRequestError.name) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Slug is taken. Please try another slug');
        }
      }
      throw error;
    }
  }

  // Update a post
  async updatePost(id: number, dto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.getPostById(id);
    console.log(dto)
    // Check if the user is the owner of the post
    if (post.user.id !== user.id) {
      throw new ForbiddenException('Not Authorized');
    }
    try {

      const updatedPost = await this.prisma.post.update({
        where: {
          id,
        },
        data: {
          title: dto.title,
          content: dto.content,
          slug: dto.slug,
          status: dto.status,
          ...(dto.status === PostStatus.PUBLISHED && { publishedAt: new Date() }),
        },
      });
      return updatedPost;
    } catch (error) {
      console.log(error)
      throw new ForbiddenException('Eerroeeo');
    }
  }

  // Delete a post
  async deletePost(id: number, user: User): Promise<string> {
    const post = await this.getPostById(id);

    // Check if the user is the owner of the post
    if (post.user.id !== user.id) {
      throw new ForbiddenException('Not Authorized');
    }
    await this.prisma.post.delete({
      where: {
        id,
      },
    });
    return "Post deleted successfully";
  }
}
