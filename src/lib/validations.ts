import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const carSchema = z.object({
  name: z.string().min(1, "Car name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),

  default_price: z.coerce.number().min(0, "Price must be positive"),
  default_km: z.coerce.number().int().min(0, "KM must be positive"),
  default_extra_km: z.coerce.number().min(0, "Extra KM rate must be positive"),
  default_deposit: z.coerce.number().min(0, "Deposit must be positive"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const quoteSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email().optional().or(z.literal("")),
  quote_date: z.string().min(1, "Date is required"),
  destination: z.string().optional(),
  selected_cars: z.array(z.number()).min(1, "Select at least one car"),
});

export const quotePricingSchema = z.object({
  client_name: z.string().optional(),
  client_email: z.string().optional(),
  destination: z.string().optional(),
  cars: z.array(
    z.object({
      car_id: z.number(),
      custom_price: z.coerce.number().min(0),
      custom_km: z.coerce.number().int().min(0),
      custom_extra_km: z.coerce.number().min(0),
      custom_deposit: z.coerce.number().min(0),
    })
  ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CarInput = z.infer<typeof carSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuotePricingInput = z.infer<typeof quotePricingSchema>;
