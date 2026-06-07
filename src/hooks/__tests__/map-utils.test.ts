import { geocodeLocation } from '../../../lib/map-utils';

// Mock global fetch
global.fetch = jest.fn();

describe('Map Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('geocodeLocation', () => {
    it('returns coordinates from OSM Nominatim search', async () => {
      const mockResponse = [
        {
          lat: '41.8902',
          lon: '12.4922',
        },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const coords = await geocodeLocation('Rome Colosseum');
      expect(coords).toEqual({ latitude: 41.8902, longitude: 12.4922 });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('caches and returns cached coordinates on subsequent calls', async () => {
      const mockResponse = [
        {
          lat: '48.8584',
          lon: '2.2945',
        },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Call first time (cache miss)
      const coords1 = await geocodeLocation('Paris Eiffel');
      expect(coords1).toEqual({ latitude: 48.8584, longitude: 2.2945 });

      // Call second time (cache hit)
      const coords2 = await geocodeLocation('Paris Eiffel');
      expect(coords2).toEqual({ latitude: 48.8584, longitude: 2.2945 });
      expect(global.fetch).toHaveBeenCalledTimes(1); // called only once
    });
  });
});
