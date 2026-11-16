import { z } from 'zod';

/** Response contracts for the Restful-Booker API, validated at runtime. */

export const bookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({
    checkin: z.iso.date(),
    checkout: z.iso.date(),
  }),
  additionalneeds: z.string().optional(),
});

export const createdBookingSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: bookingSchema,
});

export const bookingIdListSchema = z.array(z.object({ bookingid: z.number().int() }));

export const authTokenSchema = z.object({ token: z.string().min(1) });

export type Booking = z.infer<typeof bookingSchema>;
export type CreatedBooking = z.infer<typeof createdBookingSchema>;
