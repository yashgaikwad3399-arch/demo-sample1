import { Router } from 'express';
import { getHealthCheck, getSystemInfo } from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health-check endpoint returning system uptime and MySQL status
 * @access  Public
 */
router.get('/health', getHealthCheck);

/**
 * @route   GET /api/info
 * @desc    Metadata and roadmap information about the Smart Examination Portal
 * @access  Public
 */
router.get('/info', getSystemInfo);

export default router;
