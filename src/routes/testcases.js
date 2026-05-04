import express from 'express';
import { TestCaseController } from '../controllers/TestCaseController.js';
import { VerifyToken } from '../middleware/AuthMiddleware.js';
import AdminMiddleware from '../middleware/AdminMiddleware.js';

export const testCaseRouter = express.Router({ mergeParams: true });

testCaseRouter.get('/', VerifyToken, AdminMiddleware, TestCaseController.list);
testCaseRouter.post('/', VerifyToken, AdminMiddleware, TestCaseController.add);
testCaseRouter.put('/', VerifyToken, AdminMiddleware, TestCaseController.replaceAll);
testCaseRouter.patch('/:tcId', VerifyToken, AdminMiddleware, TestCaseController.update);
testCaseRouter.delete('/:tcId', VerifyToken, AdminMiddleware, TestCaseController.remove);
