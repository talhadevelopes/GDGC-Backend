import express from 'express';
import { SubmissionController } from '../controllers/SubmissionController.js';
import { VerifyToken } from '../middleware/AuthMiddleware.js';

export const submissionRouter = express.Router();

submissionRouter.post('/custom-run', VerifyToken, SubmissionController.customRun);
submissionRouter.post('/run', VerifyToken, SubmissionController.run);
submissionRouter.post('/', VerifyToken, SubmissionController.submit);
submissionRouter.get('/solved', VerifyToken, SubmissionController.solved);
submissionRouter.get('/:id/status', VerifyToken, SubmissionController.status);
submissionRouter.get('/:id', VerifyToken, SubmissionController.getById);
submissionRouter.get('/', VerifyToken, SubmissionController.list);
