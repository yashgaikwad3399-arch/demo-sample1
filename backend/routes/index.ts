import { Router } from 'express';
import healthRoutes from './health.routes';
import { databaseRouter } from './database.routes';
import { authRouter } from './auth.routes';
import { studentRouter } from './student.routes';
import { examRouter } from './exam.routes';
import { adminRouter } from './admin.routes';

const router = Router();

// Mount sub-routers
router.use('/', healthRoutes);
router.use('/database', databaseRouter);
router.use('/auth', authRouter);
router.use('/student', studentRouter);
router.use('/exam', examRouter);
router.use('/admin', adminRouter);

export default router;
