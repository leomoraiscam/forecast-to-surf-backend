import './utils/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/forecast';
import { Application } from 'express';
import * as database from '@src/database';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/users';
import logger from './logger';
import * as http from 'http';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import apiDocs from './swagger.json';
import { apiErrorValidator } from './middlewares/api-error-validator';

export class SetupServer extends Server {
  private server?: http.Server;

  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docsSetup();
    this.setupController();
    await this.databaseSetup();
    this.setupErrorHandlers();
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      logger.info('🚀 Server is running')
    })
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      expressPino({
        logger,
        prettyPrint: { colorize: true }
      })
    );
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocs));
  }

  private setupController(): void {
    const forcastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();

    this.addControllers([forcastController, beachesController, usersController]);
  }
  
  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }
}