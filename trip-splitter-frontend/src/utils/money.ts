import type { Expense,Member,Split } from '../types/models';
/** Read decimal text as integer hundredths without rounding an invalid input. */
export function parseHundredths(text: string): number|null {
  if(!/^\d+(?:\.\d{1,2})?$/.test(text))
    return null;
  const [whole='',fraction='']=text.split('.');
  const result=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  return Number.isSafeInteger(result)? result:null;
}
/** Division is only for display; all stored amounts and allocations are integers. */
export const formatMoney=(paise: number): string => new Intl.NumberFormat('en-IN',{ style: 'currency',currency: 'INR' }).format(paise/100);
export const sum=(values: number[]): number => values.reduce((a,b) => a+b,0);
/** Largest-remainder allocation; member IDs break ties, including equal splits. */
function allocate(amount: number,weights: Record<string,number>,denominator: number): Record<string,number> {
  const rows=Object.entries(weights)
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([id,weight]) => ({
      id,
      value: Math.floor(amount*weight/denominator),
      remainder: amount*weight%denominator,
    }));
  let left=amount-sum(rows.map(row => row.value));
  rows.sort((a,b) => b.remainder-a.remainder||a.id.localeCompare(b.id));
  for(const row of rows) {
    if(left>0) {
      row.value++;
      left--;
    }
  }
  return Object.fromEntries(rows.map(row => [row.id,row.value]));
}
export function splitExpense(expense: Pick<Expense,'amount'|'split'>): Record<string,number> {
  const { amount,split }=expense;
  // The assignment's upper bound also keeps amount * basisPoints safely integral.
  if(amount<=0||amount>100000000||!Number.isSafeInteger(amount)) {
    throw new Error('Invalid amount');
  }
  if(split.type==='equal') {
    if(!split.memberIds.length||new Set(split.memberIds).size!==split.memberIds.length) {
      throw new Error('Select unique members');
    }
    return allocate(amount,Object.fromEntries(split.memberIds.map(id => [id,1])),split.memberIds.length);
  }
  const entries=Object.entries(split.shares);
  if(!entries.length)
    throw new Error('Missing shares');
  if(split.type==='exact') {
    if(entries.some(([,value]) => !Number.isSafeInteger(value)||value<0)||
      sum(Object.values(split.shares))!==amount) {
      throw new Error('Exact shares must equal amount');
    }
    return { ...split.shares };
  }
  // PDF data stores percentages; arithmetic uses integer basis points (100% = 10000).
  const weights: Record<string,number>={};
  for(const [id,percent] of entries) {
    const weight=parseHundredths(String(percent));
    if(weight===null||weight>10000)
      throw new Error('Invalid percentage');
    weights[id]=weight;
  }
  if(sum(Object.values(weights))!==10000)
    throw new Error('Percentages must total 100');
  return allocate(amount,weights,10000);
}
/** Every value is integer paise; participation is independent of being the payer. */
export interface Contribution {
  member: Member;
  participated: boolean;
  paid: number;
  share: number;
  net: number;
}

export function expenseContributions(members: Member[], expense: Expense): Contribution[] {
  const shares = splitExpense(expense);
  return members.map(member => {
    const participated = expense.split.type === 'equal'
      ? expense.split.memberIds.includes(member.id)
      : (expense.split.shares[member.id] ?? 0) > 0;
    const paid = expense.paidBy === member.id ? expense.amount : 0;
    const share = shares[member.id] ?? 0;
    return { member, participated, paid, share, net: paid - share };
  });
}

export function expenseBreakdown(members: Member[], expense: Expense) {
  const entries = expenseContributions(members, expense);
  return {
    entries,
    totalPaid: sum(entries.map(entry => entry.paid)),
    totalShares: sum(entries.map(entry => entry.share)),
    net: sum(entries.map(entry => entry.net)),
  };
}

export function memberBreakdown(member: Member, expenses: Expense[]) {
  const entries = expenses.toSorted((a, b) => b.date.localeCompare(a.date)).map(expense => {
    const contribution = expenseContributions([member], expense)[0];
    if (!contribution) throw new Error('Missing member contribution');
    return { expense, ...contribution };
  });
  return { entries, balance: sum(entries.map(entry => entry.net)) };
}

export function balances(members: Member[], expenses: Expense[]): Record<string, number> {
  const result = Object.fromEntries(members.map(member => [member.id, 0]));
  for (const expense of expenses) {
    for (const contribution of expenseContributions(members, expense)) {
      result[contribution.member.id] = (result[contribution.member.id] ?? 0) + contribution.net;
    }
  }
  return result;
}

export function balanceLabel(net: number): string {
  return net > 0 ? `gets back ${formatMoney(net)}` : net < 0 ? `owes ${formatMoney(-net)}` : 'settled up';
}

export function contributionExplanation(contribution: Contribution): string {
  if (!contribution.participated && contribution.paid === 0) return 'No financial involvement; no net effect.';
  if (contribution.net === 0) return 'No net effect; settled for this expense.';
  return contribution.net > 0 ? 'Is owed money for this expense.' : 'Owes money for this expense.';
}

export function signedMoney(paise: number): string {
  return `${paise > 0 ? '+' : paise < 0 ? '−' : ''}${formatMoney(Math.abs(paise))}`;
}

export function describeSplit(split: Split): string {
  switch(split.type) {
    case 'equal': return `Equally, ${split.memberIds.length} people`;
    case 'exact': return 'Exact amounts';
    case 'percent': return 'Percentages';
  }
}
