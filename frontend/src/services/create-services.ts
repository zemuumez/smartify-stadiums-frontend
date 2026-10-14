import type { Transport } from './contracts';
import { createAuthService } from './auth.service';
import { createVenuesService } from './venues.service';
import { createBookingsService } from './bookings.service';
import { createContentService } from './content.service';
import { createTeamsService } from './teams.service';
import { createMediaService } from './media.service';
import { createBillingService } from './billing.service';
import { createAdminService } from './admin.service';
export function createServices(transport: Transport) {
  return { auth: createAuthService(transport), venues: createVenuesService(transport), bookings: createBookingsService(transport), content: createContentService(transport), teams: createTeamsService(transport), media: createMediaService(transport), billing: createBillingService(transport), admin: createAdminService(transport) };
}
