import { ForecastPoint, StormGlass } from '@src/clients/StormGlass';
import _ from 'lodash';
import logger from '@src/logger';
import { InternalError } from '@src/utils/errors/InternalError';
import { Beach } from '@src/models/Beach';
import { RatingService } from './RatingService';

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export interface BeachForecast extends Omit<Beach, 'userId'>, ForecastPoint {}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`)
  }
}

export class ForecastService {
  constructor(
    protected stormGlassClient = new StormGlass(),
    protected ratingService: typeof RatingService = RatingService
  ) {}

  public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
    try {
      const beachForecast = await this.calculateRating(beaches);
  
      const timeForecast = this.mapForecastByTime(beachForecast);
    
      return timeForecast.map((t) => ({
        time: t.time,
        forecast: _.orderBy(t.forecast, ['rating'], ['desc']),
      }));
  
    } catch (error) {
      throw new ForecastProcessingInternalError(error.message)
    }
  } 

  private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    
    logger.info(`Preparing the forecast for ${beaches.length} beaches`);
    
    for (const beach of beaches) {
      const rating = new this.ratingService(beach);
      
      const points = await this.stormGlassClient.fetchPoints(beach.lat, beach.lng);
      
      const enrichedBeachData = this.getEnrichedBeachData(points, beach, rating);
      
      pointsWithCorrectSources.push(...enrichedBeachData);
    }

    return pointsWithCorrectSources;
  }

  private getEnrichedBeachData(points: ForecastPoint[], beach: Beach, rating: RatingService): BeachForecast[] {
    return points.map((point) => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: rating.getRateForPoint(point),
      },
      ...point
    }));
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];

    for(const point of  forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);

      if(timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point]
        })
      }
    }

    return forecastByTime;
  }
}