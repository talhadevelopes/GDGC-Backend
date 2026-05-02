import express from 'express';
import { ProblemController } from '../controllers/ProblemController.js';
import { TestCaseController } from '../controllers/TestCaseController.js';
import { VerifyToken } from '../middleware/AuthMiddleware.js';
import AdminMiddleware from '../middleware/AdminMiddleware.js';

export const problemRouter = express.Router();

problemRouter.get('/', ProblemController.list);
problemRouter.get('/:id', ProblemController.getById);
problemRouter.post('/', VerifyToken, AdminMiddleware, ProblemController.create);
problemRouter.put('/:id', VerifyToken, AdminMiddleware, ProblemController.update);
problemRouter.delete('/:id', VerifyToken, AdminMiddleware, ProblemController.delete);

problemRouter.post('/:id/run', VerifyToken, ProblemController.run);

problemRouter.get('/:id/testcases', VerifyToken, AdminMiddleware, TestCaseController.list);
problemRouter.post('/:id/testcases', VerifyToken, AdminMiddleware, TestCaseController.add);
problemRouter.put('/:id/testcases', VerifyToken, AdminMiddleware, TestCaseController.replaceAll);
problemRouter.delete('/:id/testcases/:tcId', VerifyToken, AdminMiddleware, TestCaseController.remove);
