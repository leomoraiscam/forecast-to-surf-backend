import config from 'config';
import pino from 'pino';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IApplicationConfig {
  port: number;
  env: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ILoggerConfig {
  enabled: boolean;
  level: string;
}

const appConfig: IApplicationConfig = config.get('App');
const loggerConfig: ILoggerConfig = config.get('App.logger');

export default pino({
  enabled: loggerConfig.enabled,
  level: loggerConfig.level,
  prettyPrint:  appConfig.env !== 'production'
});