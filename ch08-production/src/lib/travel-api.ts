// ホテル・航空券の予約 API の代わりに、メモリ上で動く簡単な実装
const hotels = new Map<string, { destination: string; dates: string }>();
let nextId = 1;

export const hotelAPI = {
  async book(destination: string, dates: string): Promise<string> {
    const id = `hotel-${nextId++}`;
    hotels.set(id, { destination, dates });
    return id;
  },
  async cancel(hotelId: string): Promise<void> {
    hotels.delete(hotelId);
  },
  has(hotelId: string): boolean {
    return hotels.has(hotelId);
  },
};

export const flightAPI = {
  async book(destination: string, dates: string): Promise<string> {
    return `flight-${destination}-${dates}`;
  },
};
