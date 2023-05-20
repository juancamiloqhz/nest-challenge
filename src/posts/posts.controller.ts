import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import type { User, Post as PostType } from '@prisma/client';
import { UpdatePostDto, CreatePostDto } from './dto';
import { JwtGuard } from 'src/user/guard';
import { GetUser } from 'src/user/decorator';

@UseGuards(JwtGuard)
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) { }

  @Get()
  getAllPosts(): Promise<Omit<PostType, "status" | "createdAt" | "updatedAt" | "userId">[]> {
    return this.postsService.getAllPosts();
  }

  @Post()
  createPost(
    @Body() dto: CreatePostDto,
    @GetUser() user: User
  ): Promise<PostType> {
    return this.postsService.createPost(dto, user);
  }

  @Delete(":id")
  deletePost(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<string> {
    return this.postsService.deletePost(id, user);
  }

  @Patch(":id")
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePostDto,
    @GetUser() user: User
  ): Promise<PostType> {
    return this.postsService.updatePost(id, data, user);
  }
}
