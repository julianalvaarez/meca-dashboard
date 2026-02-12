import * as z from "zod";
import { editSchema, formSchema } from "./components/sports/SportsManagement";

export type SportStats = {
  id?: number;
  year: number;
  month: number;
  sport: string;
  courts_rented: number;
  total_income: number;
}

export type FoodStats = {
  id?: number;
  year: number;
  month: number;
  total_income: number;
  total_expense: number;
}

export type ClothingStats = {
  id?: number;
  year: number;
  month: number;
  total_income: number;
}

export type SportsStats = {
  futbol: {
    courts: number;
    income: number;
  },
  padel_indoor: {
    courts: number;
    income: number;
  },
  padel_outdoor: {
    courts: number;
    income: number;
  }
}

export type ClothingsStats = {
  created_at: string;
  id: number;
  month: number;
  total_income: number;
  year: number;
}
export type FoodsStats = {
  created_at: string;
  id: number;
  month: number;
  total_income: number;
  total_expense: number;
  year: number;
}


export type FormValues = z.infer<typeof formSchema>
export type EditValues = z.infer<typeof editSchema>