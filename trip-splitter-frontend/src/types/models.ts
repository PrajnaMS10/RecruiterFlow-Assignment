export const categories=['Food','Travel','Stay','Activities','Other'] as const; // Literal tuple derives the category union without duplicating it.
export type Category=typeof categories[number];
export interface Member {
  id: string;
  name: string;
}
export interface EqualSplit {
  type: 'equal';
  memberIds: string[];
}
export interface ExactSplit {
  type: 'exact';
  shares: Record<string,number>;
}
export interface PercentageSplit {
  type: 'percent';
  shares: Record<string,number>;
}
export type Split=EqualSplit|ExactSplit|PercentageSplit;
export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  category: Category;
  split: Split;
}
export interface TripState {
  members: Member[];
  expenses: Expense[];
}
export interface FormValues {
  description: string;
  amount: string;
  paidBy: string;
  date: string;
  category: string;
  method: Split['type'];
  selected: string[];
  shares: Record<string,string>;
}
export type Errors=Record<string,string>;
