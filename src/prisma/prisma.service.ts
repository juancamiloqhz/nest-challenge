import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }
  // async onModuleInit() {
  //   await this.$connect();
  // }

  // async enableShutdownHooks(app: INestApplication) {
  //   this.$on('beforeExit', async () => {
  //     await app.close();
  //   });
  // }

  cleanDatabase() {
    // console.log('Cleaning database...');
    return this.$transaction([
      this.user.deleteMany(),
      this.post.deleteMany(),
      this.comment.deleteMany(),
    ]);
  }
}
