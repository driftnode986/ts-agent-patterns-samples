// #region steps
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { hotelAPI, flightAPI } from '../../lib/travel-api';

const TripInput = z.object({ destination: z.string(), dates: z.string() });

const bookHotel = createStep({
  id: 'book-hotel',
  inputSchema: TripInput,
  outputSchema: z.object({ hotelId: z.string() }),
  execute: async ({ inputData }) => {
    const { destination, dates } = inputData;
    const hotelId = await hotelAPI.book(destination, dates);
    return { hotelId };
  },
});

const bookFlight = createStep({
  id: 'book-flight',
  inputSchema: z.object({ hotelId: z.string() }),
  outputSchema: z.object({ flightId: z.string() }),
  execute: async ({ getInitData }) => {
    const { destination, dates } = getInitData<typeof bookingSaga>();
    const flightId = await flightAPI.book(destination, dates);
    return { flightId };
  },
});
// #endregion

// #region workflow
// 補償処理: 失敗したら、完了済みのホテル予約を取り消す
async function cancelHotel(hotelId: string): Promise<void> {
  await hotelAPI.cancel(hotelId);
}

export const bookingSaga = createWorkflow({
  id: 'booking-saga',
  inputSchema: TripInput,
  outputSchema: z.object({ flightId: z.string() }),
  options: {
    onError: async ({ steps }) => {
      const hotel = steps['book-hotel'];
      if (hotel?.status === 'success') {
        await cancelHotel(hotel.output.hotelId);
      }
    },
  },
})
  .then(bookHotel)
  .then(bookFlight)
  .commit();
// #endregion
