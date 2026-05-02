import express from 'express';
import { TestCaseController } from '../controllers/TestCaseController.js';
import { VerifyToken } from '../middleware/AuthMiddleware.js';
import AdminMiddleware from '../middleware/AdminMiddleware.js';

export const testCaseRouter = express.Router({ mergeParams: true });

testCaseRouter.post('/', VerifyToken, AdminMiddleware, TestCaseController.add);
testCaseRouter.put('/', VerifyToken, AdminMiddleware, TestCaseController.replaceAll);
testCaseRouter.delete('/:tcId', VerifyToken, AdminMiddleware, TestCaseController.remove);
