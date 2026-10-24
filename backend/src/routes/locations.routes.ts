import {Router} from 'express';import {getLocation,listLocations} from '../controllers/locations.controller.js';export const locationsRouter=Router().get('/',listLocations).get('/:id',getLocation);
