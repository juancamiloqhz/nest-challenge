import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PostsModule, AuthModule, PrismaModule, UserModule, CommentsModule],
  controllers: [],
  providers: [],
})
export class AppModule { } 
