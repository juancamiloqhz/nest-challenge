import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post, PostStatus, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  getAllPosts(user: User): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getPostById(id: number, user: User): Promise<Post | null> {
    return this.prisma.post.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
  }

  async createPost(dto: CreatePostDto, user: User): Promise<Post> {
    try {
      const newPost = await this.prisma.post.create({
        data: {
          title: dto.title,
          content: dto.content,
          status: PostStatus.DRAFT,
          slug: dto.slug,
          user: { connect: { id: user.id } },
        },
      });
      return newPost;
    } catch (error) {
      if (error.constructor.name === PrismaClientKnownRequestError.name) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Slug is taken');
        }
      }
      throw error;
    }
  }
  updatePost(id: number, dto: UpdatePostDto, user: User): Promise<Post> {
    // const post = this.getPostById(id);
    const post = this.prisma.post.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    if (!post) {
      throw new ForbiddenException('Not Authorized');
    }
    return this.prisma.post.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
        content: dto.content,
        slug: dto.slug,
      },
    });
  }
  async deletePost(id: number, user: User): Promise<string> {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    if (!post) {
      throw new ForbiddenException('Not Authorized');
    }
    await this.prisma.post.delete({
      where: {
        id,
      },
    });
    return "Post deleted";
  }
}
