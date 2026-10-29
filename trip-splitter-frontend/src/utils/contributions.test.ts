import { expect, it } from 'vitest';
import { sampleData } from '../data/sample-data';
import type { Expense } from '../types/models';
import { balances, contributionExplanation, expenseContributions, expenseBreakdown, memberBreakdown, sum } from './money';

const example: Expense = {
  id: 'example', description: 'Lunch', date: '2026-03-15', category: 'Food', amount: 10000,
  paidBy: 'm4', split: { type: 'equal', memberIds: ['m1', 'm2'] },
};
it('shows the full payer contribution when the payer is outside the split', () => {
  const rows = expenseContributions(sampleData.members, example);
  expect(rows.map(({ member, ...row }) => ({ id: member.id, ...row }))).toEqual([
    { id:'m1', participated:true, paid:0, share:5000, net:-5000 },
    { id:'m2', participated:true, paid:0, share:5000, net:-5000 },
    { id:'m3', participated:false, paid:0, share:0, net:0 },
    { id:'m4', participated:false, paid:10000, share:0, net:10000 },
    { id:'m5', participated:false, paid:0, share:0, net:0 },
  ]);
  expect(sum(rows.map(row => row.net))).toBe(0);
});
it('separates a participating payer’s payment from their own share', () => {
  const rows = expenseContributions(sampleData.members, { ...example, amount:100000, paidBy:'m1', split:{type:'equal',memberIds:sampleData.members.map(m => m.id)} });
  expect(rows.find(row => row.member.id === 'm1')).toMatchObject({paid:100000,share:20000,net:80000,participated:true});
});
it('member details include all expenses and match every summary balance exactly', () => {
  const summary = balances(sampleData.members, sampleData.expenses);
  for (const member of sampleData.members) {
    const detail = memberBreakdown(member, sampleData.expenses);
    expect(detail.entries).toHaveLength(sampleData.expenses.length);
    expect(sum(detail.entries.map(entry => entry.net))).toBe(summary[member.id]);
    expect(detail.balance).toBe(summary[member.id]);
    expect(detail.entries[0]?.expense.id).toBe('e6');
  }
});
it('all sample split types preserve shares, payments, and zero net contributions', () => {
  for (const expense of sampleData.expenses) {
    const detail = expenseBreakdown(sampleData.members, expense);
    const rows = detail.entries;
    expect(detail.totalPaid).toBe(expense.amount);
    expect(detail.totalShares).toBe(expense.amount);
    expect(detail.net).toBe(0);
    expect(rows).toHaveLength(5);
    expect(sum(rows.map(row => row.share))).toBe(expense.amount);
    expect(sum(rows.map(row => row.paid))).toBe(expense.amount);
    expect(sum(rows.map(row => row.net))).toBe(0);
    expect(rows.every(row => Number.isSafeInteger(row.net))).toBe(true);
  }
});
it('distinguishes zero-share rounding participants, uninvolved members, and settled payers', () => {
  const rows = expenseContributions(sampleData.members, {...example, amount:1, split:{type:'percent',shares:{m1:99.99,m2:0.01,m3:0}}});
  const tiny = rows.find(row => row.member.id === 'm2');
  const uninvolved = rows.find(row => row.member.id === 'm3');
  if (!tiny || !uninvolved) throw new Error('Missing member');
  expect(tiny).toMatchObject({participated:true,share:0,net:0});
  expect(contributionExplanation(tiny)).toContain('settled');
  expect(contributionExplanation(uninvolved)).toContain('No financial involvement');
  const settled = expenseContributions(sampleData.members,{...example,paidBy:'m1',split:{type:'exact',shares:{m1:10000}}});
  expect(settled.find(row => row.member.id === 'm1')).toMatchObject({paid:10000,share:10000,net:0});
});
it('supports an empty trip and stays in sync after additions and deletions', () => {
  for (const member of sampleData.members) {
    expect(memberBreakdown(member,[])).toEqual({entries:[],balance:0});
    for (const expenses of [[...sampleData.expenses,example],sampleData.expenses.slice(1)]) {
      expect(memberBreakdown(member,expenses).balance).toBe(balances(sampleData.members,expenses)[member.id]);
    }
  }
});
