import { sampleData } from '../data/sample-data';
import type { Expense } from '../types/models';
import { isCategory,validDate } from '../utils/validation';
import { splitExpense } from '../utils/money';
export const STORAGE_KEY='goa-trip-expenses-v1';
function record(value: unknown): value is Record<string,unknown> { return typeof value==='object'&&value!==null&&!Array.isArray(value); }
export function isExpense(value: unknown): value is Expense {
  if(!record(value)||typeof value.id!=='string'||!value.id||typeof value.description!=='string'||!value.description.trim()||value.description.length>60||typeof value.amount!=='number'||!Number.isSafeInteger(value.amount)||value.amount<=0||value.amount>100000000||typeof value.paidBy!=='string'||!sampleData.members.some(m => m.id===value.paidBy)||typeof value.date!=='string'||!validDate(value.date)||typeof value.category!=='string'||!isCategory(value.category)||!record(value.split))
    return false;
  const split=value.split;
  const known=(id: string) => sampleData.members.some(m => m.id===id);
  if(split.type==='equal')
    return Array.isArray(split.memberIds)&&split.memberIds.length>0&&split.memberIds.every((id: unknown) => typeof id==='string'&&known(id))&&new Set(split.memberIds).size===split.memberIds.length;
  if((split.type!=='exact'&&split.type!=='percent')||!record(split.shares))
    return false;
  const shares: Record<string,number>={};
  for(const [id,share] of Object.entries(split.shares)) {
    if(!known(id)||typeof share!=='number')
      return false;
    shares[id]=share;
  }
  try {
    splitExpense({ amount: value.amount,split: { type: split.type,shares } });
    return true;
  }
  catch {
    return false;
  }
}
export function loadExpenses(): Expense[] {
  try {
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw!==null) {
      const parsed: unknown=JSON.parse(raw);
      if(Array.isArray(parsed)&&parsed.every(isExpense)&&new Set(parsed.map(e => e.id)).size===parsed.length)
        return parsed;
    }
  }
  catch { /* Unavailable storage or corrupt JSON: safely use sample data. */ }
  return structuredClone(sampleData.expenses);
}
