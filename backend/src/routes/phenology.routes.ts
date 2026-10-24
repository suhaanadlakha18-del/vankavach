import {Router} from 'express';import {getPhenology} from '../controllers/phenology.controller.js';export const phenologyRouter=Router().get('/:locationId',getPhenology);
