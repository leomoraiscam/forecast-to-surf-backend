import config from 'config';
import mongoose, { Mongoose } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export default interface IDatabaseConfig {
  mongoUrl: string;
}


const dbConfig: IDatabaseConfig = config.get('App.database');

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(dbConfig.mongoUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

export const close = (): Promise<void> => mongoose.connection.close();