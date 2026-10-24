import {Router} from 'express';import {getSummary} from '../controllers/summary.controller.js';export const summaryRouter=Router().get('/',getSummary);
