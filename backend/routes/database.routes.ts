import { Router } from 'express';
import { DatabaseController } from '../controllers/database.controller';

const router = Router();

router.get('/status', DatabaseController.getStatus);
router.get('/schema', DatabaseController.getSchema);
router.get('/sample-data', DatabaseController.getSampleData);
router.post('/test-connection', DatabaseController.testConnection);
router.post('/initialize', DatabaseController.initializeDatabase);

export const databaseRouter = router;
