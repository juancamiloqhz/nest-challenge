import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import { after, afterAll, before, beforeAll, binding, then } from 'cucumber-tsflow';
import { AppModule } from '../../src/app.module';
import Context from '../support/world';
import { PrismaService } from '../../src/prisma/prisma.service';
import { DataTable } from '@cucumber/cucumber';

@binding([Context])
export class responses {
  constructor(protected context: Context) { }

  @after()
  public async after(): Promise<void> {
    await this.context.app.close();
  }

  // @beforeAll()
  // public async beforeAll(): Promise<void> {
  // }

  @before()
  public async before(): Promise<void> {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.context.app = moduleRef.createNestApplication();
    this.context.app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    this.context.app.setGlobalPrefix('api/v1');
    await this.context.app.init();
    this.context.prisma = await this.context.app.get(PrismaService);
    await this.context.prisma.cleanDatabase();
  }

  @then(
    /The response status code should be (200|201|204|400|401|403|404|413|500|503)/,
  )
  public statusResponse(status: string) {
    expect(this.context.response.status).to.equal(parseInt(status));
  }

  @then(/The response should be "([^"]*)"/)
  public dataResponse(data: string) {
    expect(this.context.response.text).to.equal(data);
  }

  @then(/The response-text should contain "([^"]*)"/)
  public validateAPIVersion(text: string) {
    const responseString = this.context.response.text;
    expect(responseString).to.equal(text);
  }

  @then(/The response should contain:/)
  public dataResponseTable(table: DataTable) {
    // console.log(table.rowsHash())
    console.log(JSON.parse(this.context.response.text));
    // const data = this.context.tableToObject(table);
    console.log("tableToObject: ", table.raw())
  }
}