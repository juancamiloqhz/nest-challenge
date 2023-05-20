import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PostStatus } from '../post.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(30000)
  content: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}