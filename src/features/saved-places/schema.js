import { z } from 'zod';

export const savedPlaceSchema = z.object({
  name: z.string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(100, { message: "Name must be at most 100 characters long" }),
  lat: z.number()
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" }),
  lng: z.number()
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" }),
});
