import { Router } from 'express';
import authRoute from './authRoute';
import userRoute from './userRoute';
import roleRoute from './roleRoute';
import imageRoute from './imageRoute';
import lexiRoute from './lexiRoute';
import contractRoute from './contractRoute';
import clauseRoute from './clauseRoute';
import templateRoute from './templateRoute';
import clientPortalRoute from './clientPortalRoute';
import legalStampRoute from './legalStampRoute';

const router = Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/roles', roleRoute);
router.use('/images', imageRoute);
router.use('/lexi', lexiRoute);
router.use('/contracts', contractRoute);
router.use('/clauses', clauseRoute);
router.use('/templates', templateRoute);
router.use('/client-portals', clientPortalRoute);
router.use('/legal-stamps', legalStampRoute);

export default router;
