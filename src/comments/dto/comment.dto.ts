import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30000)
  content: string;
}


export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30000)
  content: string;
}