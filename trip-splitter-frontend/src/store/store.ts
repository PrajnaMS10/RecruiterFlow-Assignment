import { configureStore,createSlice,type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch,useSelector } from 'react-redux';
import { sampleData } from '../data/sample-data';
import type { Expense,TripState } from '../types/models';
import { isExpense,loadExpenses,STORAGE_KEY } from './persistence';
const initialState: TripState={ members: sampleData.members,expenses: [] };
const trip=createSlice({
  name: 'trip',initialState,reducers: {
    addExpense(state,action: PayloadAction<Expense>) {
      if(isExpense(action.payload)&&!state.expenses.some(e => e.id===action.payload.id))
        state.expenses.push(action.payload);
    },
    deleteExpense(state,action: PayloadAction<string>) { state.expenses=state.expenses.filter(e => e.id!==action.payload); },
  }
});
export const { addExpense,deleteExpense }=trip.actions;
export function createAppStore(expenses=loadExpenses()) {
  const store=configureStore({ reducer: { trip: trip.reducer },preloadedState: { trip: { members: structuredClone(sampleData.members),expenses: structuredClone(expenses) } } });
  let previous=store.getState().trip.expenses;
  store.subscribe(() => {
    const current=store.getState().trip.expenses;
    if(current!==previous) {
      previous=current;
      try {
        localStorage.setItem(STORAGE_KEY,JSON.stringify(current));
        window.dispatchEvent(new CustomEvent('trip-storage',{ detail: false }));
      }
      catch {
        window.dispatchEvent(new CustomEvent('trip-storage',{ detail: true }));
      }
    }
  });
  return store;
}
export type AppStore=ReturnType<typeof createAppStore>;
export type RootState=ReturnType<AppStore['getState']>;
export type AppDispatch=AppStore['dispatch'];
export const useAppDispatch=useDispatch.withTypes<AppDispatch>();
export const useAppSelector=useSelector.withTypes<RootState>();
