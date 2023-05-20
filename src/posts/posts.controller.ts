import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { User, type Post as PostType } from '@prisma/client';
import { UpdatePostDto, CreatePostDto } from './dto/post.dto';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) { }

  @Get()
  getAllPosts(@GetUser() user: User): Promise<PostType[]> {
    return this.postsService.getAllPosts(user);
  }

  @Post()
  createPost(@Body() dto: CreatePostDto, @GetUser() user: User): Promise<PostType> {
    return this.postsService.createPost(dto, user);
  }

  @Delete(":id")
  deletePost(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<string> {
    return this.postsService.deletePost(id, user);
  }

  @Patch(":id")
  updatePost(@Param('id', ParseIntPipe) id: number, @Body() data: UpdatePostDto, @GetUser() user: User): Promise<PostType> {
    return this.postsService.updatePost(id, data, user);
  }
}
