import httpStatus from 'http-status-codes';
import nock from 'nock';

import { Beach, GeoPosition } from "@src/models/Beach";
import { User } from '@src/models/User';
import AuthService from '@src/services/AuthService';
import CacheUtil from '@src/utils/Cache';

import stormGlassWeather3HoursFixture from '../fixtures/stormGlass_response_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '../fixtures/api_forecast_response_1_beach.json';

describe('Beach Forecast Functional tests', () => {
  const defaultUser: User = {
    name: 'John Doe',
    email: 'john3@mail.com',
    password: '1234',
  };

  let token: string;

  beforeEach(async() => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());

    const defaultBeach: Beach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      userId: user.id
    };

    await new Beach(defaultBeach).save();

    CacheUtil.clearAllCache();
  })
  
  it('should be able to return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
      })
      .reply(200, stormGlassWeather3HoursFixture);

    const { body, status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });

    expect(status).toBe(httpStatus.OK);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('should be able to return 500 if something went wrong during the process', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v1/weather/point')
      .query({ 
        lat: '-33.792726', 
        lng: '151.289824' 
      })
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest
      .get(`/forecast`)
      .set({ 'x-access-token': token });

    expect(status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });
});
