import './utils/moduleAlias';
import { Server } from '@overnightjs/core';
import cors from 'cors';
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import apiDocs from './swagger.json';
import bodyParser from 'body-parser';
import  { 
  BeachesController,
  UsersController, 
  ForecastController 
} from './controllers'
import * as database from '@src/database';
import logger from './logger';
import { apiErrorValidator } from './middlewares/apiErrorValidator';

export class App extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<App> {
    this.setupExpress();
    await this.docsSetup();
    this.setupController();
    await this.databaseSetup();
    this.setupErrorHandlers();
    return this;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info('🚀 Server is running')
    });
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocs));
  }

  public async close(): Promise<void> {
    await database.close();
  }

  private setupController(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();

    this.addControllers([
      forecastController, 
      beachesController, 
      usersController
    ]);
  }
}