import { categories,type Category,type Errors,type Expense,type FormValues,type Member,type Split } from '../types/models';
import { formatMoney,parseHundredths,sum } from './money';
export function today(): string { const now=new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; }
export function validDate(date: string): boolean { return /^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date&&date<=today(); }
export function isCategory(value: string): value is Category { return categories.some(category => category===value); }
export function initialForm(members: Member[]): FormValues { return { description: '',amount: '',paidBy: '',date: today(),category: '',method: 'equal',selected: members.map(m => m.id),shares: Object.fromEntries(members.map(m => [m.id,'0'])) }; }
export function remaining(values: FormValues): string {
  const total=sum(Object.values(values.shares).map(value => parseHundredths(value)??0));
  const difference=(values.method==='percent'? 10000:parseHundredths(values.amount)??0)-total;
  const formatted=values.method==='percent'? `${(Math.abs(difference)/100).toFixed(2)}%`:formatMoney(Math.abs(difference));
  return difference===0? 'Fully assigned':`${formatted} ${difference>0? 'left to assign':'over assigned'}`;
}
export function validate(values: FormValues,members: Member[]): {
  errors: Errors;
  expense?: Omit<Expense,'id'>;
} {
  const errors: Errors={};
  if(!values.description.trim())
    errors.description='Description is required';
  else if(values.description.length>60)
    errors.description='Use at most 60 characters';
  const amount=parseHundredths(values.amount);
  if(!values.amount)
    errors.amount='Amount is required';
  else if(/^-/.test(values.amount)||amount===0)
    errors.amount='Amount must be more than ₹0';
  else if(amount===null)
    errors.amount='Use a valid amount with at most two decimal places';
  else if(amount>100000000)
    errors.amount='Amount cannot exceed ₹10,00,000';
  if(!members.some(m => m.id===values.paidBy))
    errors.paidBy='Paid by is required';
  if(!validDate(values.date))
    errors.date='Choose a valid date that is not in the future';
  if(!isCategory(values.category))
    errors.category='Category is required';
  let split: Split={ type: 'equal',memberIds: members.filter(m => values.selected.includes(m.id)).map(m => m.id) };
  if(values.method==='equal') {
    if(!split.memberIds.length)
      errors.split='Select at least one member';
  }
  else {
    const shares: Record<string,number>={};
    for(const member of members) {
      const value=parseHundredths(values.shares[member.id]??'');
      if(value===null||(values.method==='percent'&&value>10000))
        errors[`share-${member.id}`]=values.method==='percent'? 'Enter 0–100 with at most two decimals':'Enter a non-negative amount with at most two decimals';
      else
        shares[member.id]=value;
    }
    if(Object.keys(errors).some(key => key.startsWith('share-')))
      errors.split='Correct the member shares';
    else {
      const target=values.method==='percent'? 10000:amount;
      if(target!==null&&sum(Object.values(shares))!==target)
        errors.split=remaining(values);
    }
    split=values.method==='exact'? { type: 'exact',shares }:{ type: 'percent',shares: Object.fromEntries(Object.entries(shares).map(([id,value]) => [id,value/100])) };
  }
  if(Object.keys(errors).length||amount===null||!isCategory(values.category))
    return { errors };
  return { errors,expense: { description: values.description.trim(),amount,paidBy: values.paidBy,date: values.date,category: values.category,split } };
}
