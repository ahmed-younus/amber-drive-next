export interface Car {
  id: number;
  name: string;
  brand: string;
  category: string;

  image: string;
  default_price: number;
  default_km: number;
  default_extra_km: number;
  default_deposit: number;
  description: string | null;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: number;
  quote_number: string;
  client_name: string;
  client_email: string | null;
  quote_date: string;
  destination: string | null;
  total_amount: number | null;
  status: "draft" | "sent" | "confirmed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteCar {
  id: number;
  quote_id: number;
  car_id: number;
  custom_price: number;
  custom_km: number;
  custom_extra_km: number;
  custom_deposit: number;
  car?: Car;
}

export interface QuoteWithCars extends Quote {
  cars: QuoteCar[];
}

export interface DashboardStats {
  total_cars: number;
  active_cars: number;
  total_quotes: number;
  draft_quotes: number;
  sent_quotes: number;
  confirmed_quotes: number;
  recent_quotes: QuoteWithCars[];
}

export interface AISearchResponse {
  car_ids: number[];
  message?: string;
}
