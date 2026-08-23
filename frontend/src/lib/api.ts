import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Types
export interface User {
  id: string;
  phone: string;
  full_name?: string;
  email?: string;
  role: 'player' | 'owner' | 'admin';
  is_verified: boolean;
  avatar_url?: string;
  date_of_birth?: string;
  is_minor: boolean;
  business_name?: string;
  created_at: string;
}

export interface Stadium {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city: string;
  sub_city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  whatsapp?: string;
  status: 'draft' | 'pending' | 'active' | 'suspended' | 'deactivated';
  badge: string;
  has_camera: boolean;
  has_online_booking: boolean;
  has_referee_booking: boolean;
  distance_km?: number;
  field_count?: number;
  created_at: string;
}

export interface Field {
  id: string;
  stadium_id: string;
  name: string;
  field_number: number;
  sport_type: string;
  surface_type?: string;
  has_lighting: boolean;
  has_changing_room: boolean;
  hourly_rate_cents?: number;
  is_active: boolean;
  schedules?: FieldSchedule[];
}

export interface FieldSchedule {
  id: string;
  field_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_available: boolean;
}

export interface Booking {
  id: string;
  field_id: string;
  stadium_id: string;
  player_id: string;
  team_id?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  total_cents: number;
  payment_status: 'unpaid' | 'processing' | 'paid' | 'refunded' | 'failed';
  notes?: string;
  created_at: string;
}

export interface Camera {
  id: string;
  stadium_id: string;
  field_id?: string;
  device_key: string;
  stream_key: string;
  device_name?: string;
  device_model?: string;
  status: 'pending' | 'certified' | 'active' | 'offline' | 'revoked';
  certification_passed: boolean;
  last_heartbeat?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  tx_ref: string;
  amount_cents: number;
  fee_cents: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'paid' | 'refunded' | 'failed';
  description: string;
  created_at: string;
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  hourly_rate_cents?: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}
