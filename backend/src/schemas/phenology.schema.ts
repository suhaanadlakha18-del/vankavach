import { z } from 'zod'; export const locationParamSchema=z.object({locationId:z.string().regex(/^[a-z0-9-]{3,64}$/)});
