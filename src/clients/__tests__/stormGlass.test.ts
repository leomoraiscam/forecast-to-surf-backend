import { StormGlass } from '@src/clients/StormGlass';
import stormGlassWeather3HoursFixture from '../../../tests/fixtures/stormglass_weather_3_hours.json'; 
import stormGlassNormalized3HoursFixture from '../../../tests/fixtures/stormglass_normalized_response_3_hours.json';
import * as HTTPUtils from '@src/utils/request';
import CacheUtil from '@src/utils/cache';

jest.mock('@src/utils/request');
jest.mock('@src/utils/cache');

describe('StormGlass client', () => {
  const MockedRequestClass = HTTPUtils.Request as jest.Mocked<typeof HTTPUtils.Request>
  const mockedRequest = new HTTPUtils.Request as jest.Mocked<HTTPUtils.Request>;
  const MockedCacheUtil = CacheUtil as jest.Mocked<typeof CacheUtil>;

  it('should return the normalize forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({data: stormGlassWeather3HoursFixture} as HTTPUtils.Response);
   
    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);
   
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });


  it('should get the normalized forecast points from cache and use it to return data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({
      data: null,
    } as HTTPUtils.Response);

    MockedCacheUtil.get.mockReturnValue(stormGlassNormalized3HoursFixture);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });

  it('should exclude incomplete data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300
          },
          time: "2020-04-26T00:00:00+00:00",
        }
      ]
    }

    mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUtils.Response );

    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should get a generic error from stormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({message: 'Network Error'});

    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassesResponseError when the StormGlasses service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    MockedRequestClass.isRequestError.mockReturnValue(true);
    
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});