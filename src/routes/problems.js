import express from 'express';
import { ProblemController } from '../controllers/ProblemController.js';
import { TestCaseController } from '../controllers/TestCaseController.js';
import { LeetcodeImporter } from '../controllers/LeetcodeImporter.js';
import { TestCaseAIController } from '../controllers/TestCaseAIController.js';
import { VerifyToken } from '../middleware/AuthMiddleware.js';
import AdminMiddleware from '../middleware/AdminMiddleware.js';

export const problemRouter = express.Router();

// these routes are all about creating a problem , adding test cases to the problem statement and etc etc


problemRouter.get('/', ProblemController.list);
problemRouter.post('/import-leetcode', VerifyToken, AdminMiddleware, LeetcodeImporter.import);
problemRouter.get('/:id', ProblemController.getById);
problemRouter.post('/', VerifyToken, AdminMiddleware, ProblemController.create);
problemRouter.put('/:id', VerifyToken, AdminMiddleware, ProblemController.update);
problemRouter.delete('/:id', VerifyToken, AdminMiddleware, ProblemController.delete);

// problemRouter.post('/:id/run', VerifyToken, ProblemController.run);

problemRouter.post('/:id/generate-testcases', VerifyToken, AdminMiddleware, TestCaseAIController.generate);
problemRouter.get('/:id/testcases', VerifyToken, AdminMiddleware, TestCaseController.list);
problemRouter.post('/:id/testcases', VerifyToken, AdminMiddleware, TestCaseController.add);
problemRouter.put('/:id/testcases', VerifyToken, AdminMiddleware, TestCaseController.replaceAll);
problemRouter.patch('/:id/testcases/:tcId', VerifyToken, AdminMiddleware, TestCaseController.update);
problemRouter.delete('/:id/testcases/:tcId', VerifyToken, AdminMiddleware, TestCaseController.remove);
