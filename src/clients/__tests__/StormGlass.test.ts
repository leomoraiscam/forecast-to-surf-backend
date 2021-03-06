import { StormGlass } from '@src/clients/StormGlass';
import * as HTTPUtils from '@src/utils/Request';
import CacheUtil from '@src/utils/Cache';

import stormGlassWeather3HoursFixture from '../../../tests/fixtures/stormGlass_response_weather_3_hours.json'; 
import stormGlassNormalized3HoursFixture from '../../../tests/fixtures/stormGlass_normalized_response_3_hours.json';

jest.mock('@src/utils/Request');
jest.mock('@src/utils/Cache');

describe('Storm Glass Client tests', () => {
  const MockedRequestClass = HTTPUtils.Request as jest.Mocked<typeof HTTPUtils.Request>
  const mockedRequest = new HTTPUtils.Request as jest.Mocked<HTTPUtils.Request>;
  const MockedCacheUtil = CacheUtil as jest.Mocked<typeof CacheUtil>;

  it('should be able to return the normalize forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture
    } as HTTPUtils.Response);
   
    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);
   
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });

  it('should be able to get the normalized forecast points from cache and use it to return data points', async () => {
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

  it('should be able to exclude incomplete data points', async () => {
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

    mockedRequest.get.mockResolvedValue({ 
      data: incompleteResponse 
    } as HTTPUtils.Response );

    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);

    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should be able to get a generic error from stormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({message: 'Network Error'});

    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should be able to get an StormGlassesResponseError when the StormGlasses service responds with error', async () => {
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