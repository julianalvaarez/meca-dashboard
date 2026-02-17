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

export type FoodIncome = {
  id?: string;
  year: number;
  month: number;
  total_income: number;
  created_at?: string;
}

export type ExpenseCategory = 'materia_prima' | 'sueldos' | 'impuestos' | 'otros';

export type FoodExpense = {
  id?: string;
  year: number;
  month: number;
  category: ExpenseCategory;
  amount: number;
  created_at?: string;
}

export type FoodStats = {
  income: number;
  expenses: {
    materia_prima: number;
    sueldos: number;
    impuestos: number;
    otros: number;
    total: number;
  };
  netIncome: number;
  variation?: number;
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

export type Tenant = {
  id: string;
  name: string;
  created_at?: string;
}

export type TenantMonthlyIncome = {
  id?: string;
  tenant_id: string;
  year: number;
  month: number;
  total_income: number;
  created_at?: string;
  tenants?: { name: string }; // For joins
}

export type TenantStats = {
  totalIncome: number;
  tenants: {
    id: string;
    name: string;
    income: number;
  }[];
  variation?: number;
}

export type Event = {
  id: string;
  name: string;
  created_at?: string;
}

export type EventMonthlyIncome = {
  id?: string;
  event_id: string;
  year: number;
  month: number;
  total_income: number;
  created_at?: string;
  events?: { name: string };
}

