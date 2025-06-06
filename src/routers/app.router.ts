import app, {Router} from 'express';
const router: Router = app.Router();
const redirectionServices = require('../services/redirect');


router.get('/:shortUrlId', redirectionServices.cacheLookUp, redirectionServices.loadUrlDocument, redirectionServices.redirect)

export default router;

