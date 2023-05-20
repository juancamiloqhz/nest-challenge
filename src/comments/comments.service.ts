import { ForbiddenException, Injectable } from '@nestjs/common';
import { Comment, PostStatus, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto';

type CommentById = Comment & {
  user: { id: number }
  post: { user: { id: number } }
};

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) { }

  // (Helper function) Get a single comment by id and include the user id 
  // of the user who made the comment and the user id of the user who made the post
  async getCommentById(id: number): Promise<CommentById> {
    const comment = await this.prisma.comment.findFirst({
      where: { id },
      include: {
        user: { select: { id: true } }, // The user who made the comment
        post: { select: { user: { select: { id: true } } } }, // The post that the comment belongs to and the user who made the post
      },
    });
    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }
    return comment;
  }

  // Get all comments for a post that is published, ordered by createdAt
  getPostComments(postId: number): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: {
        post: { id: postId, status: PostStatus.PUBLISHED },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Create a comment for a post
  createComment(postId: number, dto: CreateCommentDto, user: User): Promise<Comment> {
    // Check if the post exists and is published
    const post = this.prisma.post.findFirst({
      where: { id: postId, status: PostStatus.PUBLISHED },
    });
    if (!post) {
      throw new ForbiddenException('Post not found');
    }
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        post: { connect: { id: postId } },
        user: { connect: { id: user.id } }, // The user making the comment
      },
    });
  }

  async deleteComment(commentId: number, user: User): Promise<string> {
    const comment = await this.getCommentById(commentId);

    // Only the user who made the comment or the user who made the post can delete the comment
    if (comment.user.id !== user.id && comment.post.user.id !== user.id) {
      throw new ForbiddenException('Not Authorized');
    }
    await this.prisma.comment.delete({ where: { id: commentId } })

    return 'Comment deleted successfully'
  }

  async updateComment(commentId: number, data: { content: string }, user: User): Promise<Comment> {
    const comment = await this.getCommentById(commentId);

    // Only the user who made the comment can update the comment
    if (comment.user.id !== user.id) {
      throw new ForbiddenException('Not Authorized');
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: data.content },
    });
  }
}
