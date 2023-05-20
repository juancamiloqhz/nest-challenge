import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PostsModule, AuthModule, PrismaModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule { } 
