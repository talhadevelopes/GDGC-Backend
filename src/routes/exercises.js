import express from 'express';
import { ExerciseController } from '../controllers/ExerciseController.js';
import { VerifyToken, OptionalVerifyToken } from '../middleware/AuthMiddleware.js';
import AdminMiddleware from '../middleware/AdminMiddleware.js';

export const exerciseRouter = express.Router();

// VerifyToken is used as optional auth — if a token is present the user gets solved counts
// For the list + detail routes we want public access but richer data when logged in
exerciseRouter.get('/', OptionalVerifyToken, ExerciseController.list);
exerciseRouter.get('/:id', OptionalVerifyToken, ExerciseController.getById);
exerciseRouter.post('/', VerifyToken, AdminMiddleware, ExerciseController.create);
exerciseRouter.put('/:id', VerifyToken, AdminMiddleware, ExerciseController.update);
exerciseRouter.delete('/:id', VerifyToken, AdminMiddleware, ExerciseController.delete);
