import { beforeEach,expect,it,vi } from 'vitest';
import { loadExpenses,STORAGE_KEY } from './persistence';
import { sampleData } from '../data/sample-data';
import { addExpense,createAppStore,deleteExpense } from './store';
beforeEach(() => localStorage.clear());
it('falls back for missing, malformed and structurally invalid saved data',() => {
  expect(loadExpenses()).toEqual(sampleData.expenses); for(const raw of ['bad','{}','[{}]',JSON.stringify([{ ...sampleData.expenses[0],amount: -1 }])]) {
    localStorage.setItem(STORAGE_KEY,raw);
    expect(loadExpenses()).toEqual(sampleData.expenses);
  }
});
it('preserves an intentionally empty list and survives reload',() => {
  localStorage.setItem(STORAGE_KEY,'[]'); expect(loadExpenses()).toEqual([]); const store=createAppStore(); const expense=sampleData.expenses[0]; if(!expense)
    throw new Error('Missing sample'); store.dispatch(addExpense(expense)); expect(createAppStore().getState().trip.expenses).toEqual([expense]); store.dispatch(deleteExpense(expense.id)); expect(loadExpenses()).toEqual([]);
});
it('does not persist rejected actions and handles storage failures',() => {
  const store=createAppStore([]); const spy=vi.spyOn(Storage.prototype,'setItem'); const expense=sampleData.expenses[0]; if(!expense)
    throw new Error('Missing sample'); store.dispatch(addExpense({ ...expense,amount: -1 })); expect(spy).not.toHaveBeenCalled(); spy.mockImplementation(() => { throw new Error('Quota'); }); expect(() => store.dispatch(addExpense(expense))).not.toThrow(); expect(store.getState().trip.expenses).toHaveLength(1);
});
