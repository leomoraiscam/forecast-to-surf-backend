import supertest from 'supertest';
import { App } from '@src/App';

let app: App;

beforeAll(async () => {
  app = new App();

  await app.init();

  global.testRequest = supertest(app.getApp());
});

afterAll(async () => {
  await app.close()
});
