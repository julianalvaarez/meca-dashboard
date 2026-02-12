
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