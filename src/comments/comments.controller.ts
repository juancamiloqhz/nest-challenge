import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { CommentsService } from './comments.service';
import { GetUser } from 'src/auth/decorator';
import { Comment, User } from '@prisma/client';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@UseGuards(JwtGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) { }

  @Get(":postId")
  getPostComments(@Param("postId", ParseIntPipe) postId: number): Promise<Comment[]> {
    return this.commentsService.getPostComments(postId);
  }

  @Post(":postId")
  createComment(@Param("postId", ParseIntPipe) postId: number, @Body() dto: CreateCommentDto, @GetUser() user: User): Promise<Comment> {
    return this.commentsService.createComment(postId, dto, user);
  }

  @Delete(":commentId")
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number, @GetUser() user: User): Promise<string> {
    return this.commentsService.deleteComment(commentId, user);
  }

  @Patch(":commentId")
  updateComment(@Param('commentId', ParseIntPipe) commentId: number, @Body() data: UpdateCommentDto, @GetUser() user: User): Promise<Comment> {
    return this.commentsService.updateComment(commentId, data, user);
  }
}
