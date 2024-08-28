import request from 'supertest';
import express from 'express';
import { register } from '../../src/controllers/authController';
import dbPool from '../../src/db';
import {
  checkUserExists,
  hashPassword,
  generateUserId,
  userValidate,
} from '../../src/utils/authUtils';
import bodyParser from 'body-parser';

jest.mock('../../src/db');
jest.mock('../../src/utils/authUtils');
