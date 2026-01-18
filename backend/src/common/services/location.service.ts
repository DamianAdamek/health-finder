import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Coordinates } from '../interfaces';
import { Location as FacilityLocation } from '../../modules/facilities/entities/location.entity';

@Injectable()
export class LocationService {
    private readonly logger = new Logger(LocationService.name);
    private readonly nominatimBaseUrl = 'https://nominatim.openstreetmap.org/search';

    async getCoordinates(location: FacilityLocation): Promise<Coordinates | null> {
        const query = this.buildQuery(location);
        if (!query) return null;

        try {
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                limit: '1',
                addressdetails: '1',
            });

            // Nominatim usage policy compliance: max 1 request per second
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const response = await fetch(`${this.nominatimBaseUrl}?${params}`, {
                headers: {
                'User-Agent': 'GymManagementApp-UniversityProject/1.0 (contact: twoj@email.com)', 
                },
            });

            if (!response.ok) {
                throw new Error(`Nominatim error: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                this.logger.warn(`No coordinates found for: ${query}`);
                return null;
            }

            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
            };
        } catch (error) {
            this.logger.error(`Geocoding failed for ${query}`, error.stack);
            throw new HttpException('Geocoding service error', HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    // Haversine formula
    calculateDistance(point1: Coordinates, point2: Coordinates): number {
        if (!point1 || !point2) return Infinity;

        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.toRadians(point2.latitude - point1.latitude);
        const dLon = this.toRadians(point2.longitude - point1.longitude);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(this.toRadians(point1.latitude)) *
            Math.cos(this.toRadians(point2.latitude)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    private buildQuery(location: FacilityLocation): string {
        if (!location) return '';

        const { street, buildingNumber, zipCode, city } = location as any;

        const addressLine = [street, buildingNumber]
            .filter(Boolean)
            .join(' ');

        return [addressLine, zipCode, city]
            .filter(Boolean)
            .join(', ');
    }
}