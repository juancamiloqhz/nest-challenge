import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export default class Context {
  public app: INestApplication;
  public prisma: PrismaService;
  public response: any;
  public auth_token: string | null = null;
  public post_id: number | null = null;
  public comment_id: number | null = null;

  public tableToObject(table: any) {
    return table.rawTable.reduce((result: any, current: any) => {
      result[current[0] as string] = JSON.parse(current[1]);
      return result;
    }, {});
  }
}