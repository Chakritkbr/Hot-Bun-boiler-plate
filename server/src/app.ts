import express, { Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import dbPool from './db';
import authRoutes from './routes/authRoute';
import categoryRoutes from './routes/categoryRoute';
import discountRoutes from './routes/discountRoute';
import { consoleLogger, fileLogger } from './utils/logger';

dotenv.config({ path: './.env' });

const app: Application = express();
const SERVER_PORT = process.env.PORT || 3000;

//middleware
app.use(bodyParser.json());
app.use(fileLogger);
app.use(consoleLogger);

app.set('dbPool', dbPool);
app.set('server_port', SERVER_PORT);

app.use('', authRoutes);
app.use('', categoryRoutes);
app.use('', discountRoutes);

export default app;
