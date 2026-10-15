import { venuesService } from './index';
import type { DirectoryVenue } from './directory.types';
/** Presentation adapter: one operational venue source, no page-local fixtures. */
export const directoryService = {
  async list(signal?: AbortSignal): Promise<DirectoryVenue[]> {
    const venues = await venuesService.list(signal);
    return Promise.all(venues.map(async venue => {
      const fields = await venuesService.fields(venue.id, signal);
      const title = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
      return { id: venue.id, slug: venue.slug, name: venue.name, city: venue.city,
        address: venue.address.replace(`, ${venue.city}`, ''), rating: venue.rating ?? 0, total_reviews: venue.reviewCount,
        is_verified: venue.verified, has_camera: fields.some(f => f.camera), has_referee: !!venue.referee,
        has_lighting: fields.some(f => f.lighting), has_changing_room: fields.some(f => f.changingRoom),
        has_equipment: false, has_instant_pay: !!venue.instantPay, is_indoor: !!venue.indoor,
        fields_count: fields.length, price_from: fields.length ? Math.min(...fields.map(f => f.hourlyRateMinor)) / 100 : 0,
        sport: title(venue.primarySport || venue.sports[0] || ''), sports: venue.sports.map(title), image: venue.image, featured: venue.featured };
    }));
  },
};
