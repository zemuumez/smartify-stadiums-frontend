export interface DirectoryVenue {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  has_camera: boolean;
  has_referee: boolean;
  has_lighting: boolean;
  has_changing_room: boolean;
  has_equipment: boolean;
  has_instant_pay: boolean;
  is_indoor: boolean;
  fields_count: number;
  price_from: number;
  sport: string;
  sports: string[];
  image: string;
  featured?: boolean;
}
