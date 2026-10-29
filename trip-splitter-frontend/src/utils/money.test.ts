import { describe,expect,it } from 'vitest';
import { balances,formatMoney,parseHundredths,splitExpense,sum } from './money';
import { initialForm,validate } from './validation';
import { sampleData } from '../data/sample-data';
describe('integer money',() => {
  it('parses rupees without rounding',() => { expect(parseHundredths('1250.50')).toBe(125050); expect(parseHundredths('0.01')).toBe(1); expect(parseHundredths('1000000')).toBe(100000000); });
  it.each(['','-1','1.234','1e3','NaN','Infinity','.5',' 1','999999999999999999'])('rejects %s',input => expect(parseHundredths(input)).toBeNull());
  it('formats Indian currency',() => expect(formatMoney(10000000)).toBe('₹1,00,000.00'));
  it('assigns extra equal paise by member ID regardless of selection order',() => expect(splitExpense({ amount: 10000,split: { type: 'equal',memberIds: ['m3','m1','m2'] } })).toEqual({ m1: 3334,m2: 3333,m3: 3333 }));
  it('handles tiny amounts and a single member',() => { expect(splitExpense({ amount: 1,split: { type: 'equal',memberIds: ['m1','m2','m3'] } })).toEqual({ m1: 1,m2: 0,m3: 0 }); expect(splitExpense({ amount: 1,split: { type: 'equal',memberIds: ['m1'] } })).toEqual({ m1: 1 }); });
  it('keeps exact shares and rejects unequal totals',() => { expect(splitExpense({ amount: 3,split: { type: 'exact',shares: { m1: 1,m2: 2 } } })).toEqual({ m1: 1,m2: 2 }); expect(() => splitExpense({ amount: 3,split: { type: 'exact',shares: { m1: -1,m2: 4 } } })).toThrow(); expect(() => splitExpense({ amount: 3,split: { type: 'exact',shares: { m1: 2 } } })).toThrow(); });
  it('uses largest remainders for percentages',() => { expect(splitExpense({ amount: 149999,split: { type: 'percent',shares: { m1: 33.33,m2: 33.33,m3: 33.34 } } })).toEqual({ m1: 49995,m2: 49995,m3: 50009 }); expect(splitExpense({ amount: 1,split: { type: 'percent',shares: { m2: 50,m1: 50 } } })).toEqual({ m1: 1,m2: 0 }); });
  it('rejects invalid splits',() => {
    expect(() => splitExpense({ amount: 100,split: { type: 'equal',memberIds: [] } })).toThrow(); const invalidCases: Record<string,number>[]=[{ m1: 99.99 },{ m1: 100.001 },{ m1: -1,m2: 101 }]; for(const shares of invalidCases)
      expect(() => splitExpense({ amount: 100,split: { type: 'percent',shares } })).toThrow();
  });
  it('calculates every sample balance and conserves money',() => {
    const result=balances(sampleData.members,sampleData.expenses); expect(result).toEqual({ m1: 1855420,m2: -369578,m3: 55408,m4: -811250,m5: -730000 }); expect(sum(Object.values(result))).toBe(0); for(const expense of sampleData.expenses)
      expect(sum(Object.values(splitExpense(expense)))).toBe(expense.amount);
  });
  it('allows a payer outside the split',() => {
    const expense=sampleData.expenses.find(e => e.id==='e5'); if(!expense)
      throw new Error('Missing sample'); expect(balances(sampleData.members,[expense])).toEqual({ m1: -33334,m2: -33333,m3: -33333,m4: 100000,m5: 0 });
  });
});
describe('form validation',() => {
  const base=() => ({ ...initialForm(sampleData.members),description: 'Lunch',amount: '100',paidBy: 'm1',category: 'Food' });
  it('reports all required errors together',() => { const values={ ...initialForm(sampleData.members),date: '',selected: [] }; expect(Object.keys(validate(values,sampleData.members).errors).sort()).toEqual(['amount','category','date','description','paidBy','split']); });
  it('rejects negative, excessive precision, excessive amount, long descriptions and future dates',() => {
    for(const amount of ['-1','0','1.001','1000000.01'])
      expect(validate({ ...base(),amount },sampleData.members).expense).toBeUndefined(); expect(validate({ ...base(),amount: '-1' },sampleData.members).errors.amount).toBe('Amount must be more than ₹0'); expect(validate({ ...base(),description: 'x'.repeat(61),date: '2999-01-01' },sampleData.members).errors).toHaveProperty('date');
  });
  it('accepts exact and percentage splits only at the right totals',() => {
    for(const method of ['exact','percent'] satisfies ('exact'|'percent')[]) {
      const values={ ...base(),method,shares: { m1: '50',m2: '50',m3: '0',m4: '0',m5: '0' } };
      expect(validate(values,sampleData.members).expense).toBeDefined();
      expect(validate({ ...values,shares: { ...values.shares,m1: '49.99' } },sampleData.members).expense).toBeUndefined();
      expect(validate({ ...values,shares: { ...values.shares,m1: '-1' } },sampleData.members).errors).toHaveProperty('share-m1');
    }
  });
});
it('conserves every tested total across equal and percentage allocations',() => {
  for(const amount of [1,2,3,99,100,101,10000,149999,100000000]) {
    for(let count=1;count<=5;count++) {
      const result=splitExpense({ amount,split: { type: 'equal',memberIds: sampleData.members.slice(0,count).map(m => m.id) } });
      expect(sum(Object.values(result))).toBe(amount);
      expect(Math.max(...Object.values(result))-Math.min(...Object.values(result))).toBeLessThanOrEqual(1);
    }
    const result=splitExpense({ amount,split: { type: 'percent',shares: { m1: 0.01,m2: 33.33,m3: 66.66 } } });
    expect(sum(Object.values(result))).toBe(amount);
    expect(Object.values(result).every(Number.isSafeInteger)).toBe(true);
  }
});
it.each(['100.01','-0.01','33.333',''])('rejects an invalid individual percentage %s',share => {
  const values={ ...initialForm(sampleData.members),description: 'Lunch',amount: '100',paidBy: 'm1',category: 'Food',method: 'percent',shares: { m1: share,m2: '0',m3: '0',m4: '0',m5: '0' } } satisfies import('../types/models').FormValues;
  expect(validate(values,sampleData.members).errors).toHaveProperty('share-m1');
});
