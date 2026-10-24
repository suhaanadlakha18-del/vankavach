import {Router} from 'express';import {getObservations} from '../controllers/observations.controller.js';export const observationsRouter=Router().get('/:locationId',getObservations);
