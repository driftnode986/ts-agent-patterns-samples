// src/mastra/workflows/booking-saga.ts
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const bookHotel = createStep({
  id: 'book-hotel',
  inputSchema: z.object({ destination: z.string(), dates: z.string() }),
  outputSchema: z.object({ hotelId: z.string() }),
  execute: async ({ context }) => {
    const hotelId = await hotelAPI.book(context.destination, context.dates);
    return { hotelId };
  },
});

const cancelHotel = createStep({
  id: 'cancel-hotel',
  inputSchema: z.object({ hotelId: z.string() }),
  outputSchema: z.object({ cancelled: z.boolean() }),
  execute: async ({ context }) => {
    await hotelAPI.cancel(context.hotelId);
    return { cancelled: true };
  },
});

const bookFlight = createStep({
  id: 'book-flight',
  inputSchema: z.object({ destination: z.string(), dates: z.string() }),
  outputSchema: z.object({ flightId: z.string() }),
  execute: async ({ context }) => {
    const flightId = await flightAPI.book(context.destination, context.dates);
    return { flightId };
  },
});

export const bookingSaga = createWorkflow({
  id: 'booking-saga',
  inputSchema: z.object({ destination: z.string(), dates: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
})
  .then(bookHotel)
  .then(bookFlight)
  .catch(async (error, context) => {
    if (context.steps['book-hotel']?.output?.hotelId) {
      await cancelHotel.execute({
        context: { hotelId: context.steps['book-hotel'].output.hotelId },
      });
    }
    throw error;
  })
  .commit();
