import { ForecastPoint } from '@src/clients/StormGlass';
import { Beach, GeoPosition } from '@src/models/Beach';
import { WAVE_HEIGHTS } from '@src/constants';

export class RatingService {
  constructor(private beach: Beach) {}

  public getRatingBasedOnWindAndWavePositions(
    waveDirection: GeoPosition,
    windDirection: GeoPosition
  ): number {
    if (waveDirection === windDirection) {
      return 1;
    } else if (this.isWindOffShore(waveDirection, windDirection)) {
      return 5;
    }

    return 3;
  }

  public getRateForPoint(point: ForecastPoint): number {
    const swellDirection = this.getPositionFromLocation(point.swellDirection);

    const windDirection = this.getPositionFromLocation(point.windDirection);
    
    const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
      swellDirection,
      windDirection
    );
    
    const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
    
    const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
    
    const finalRating =
      (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3;
    
    return Math.round(finalRating);
  }

  private isWindOffShore(
    waveDirection: string,
    windDirection: string
  ): boolean {
    return (
      (waveDirection === GeoPosition.N &&
        windDirection === GeoPosition.S &&
        this.beach.position === GeoPosition.N) ||
      (waveDirection === GeoPosition.S &&
        windDirection === GeoPosition.N &&
        this.beach.position === GeoPosition.S) ||
      (waveDirection === GeoPosition.E &&
        windDirection === GeoPosition.W &&
        this.beach.position === GeoPosition.E) ||
      (waveDirection === GeoPosition.W &&
        windDirection === GeoPosition.E &&
        this.beach.position === GeoPosition.W)
    );
  }

  public getRatingForSwellPeriod(period: number): number {
    if (period < 7) return 1;

    if (period < 10) return 2;
    
    if (period < 14) return 4;
    
    return 5;
  }

  public getRatingForSwellSize(height: number): number {
    if (height < WAVE_HEIGHTS.ankleToKnee.min) return 1;

    if (height < WAVE_HEIGHTS.ankleToKnee.max) return 2;
    
    if (height < WAVE_HEIGHTS.waistHigh.max) return 3;
    
    return 5;
  }

  public getPositionFromLocation(coordinates: number): GeoPosition {
    if (coordinates < 50) return GeoPosition.N;

    if (coordinates < 120) return GeoPosition.E;
    
    if (coordinates < 220) return GeoPosition.S;
    
    if (coordinates < 310) return GeoPosition.W;
    
    return GeoPosition.N;
  }
}