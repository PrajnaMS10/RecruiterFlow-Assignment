import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { createAppStore } from '../store/store';
import { sampleData } from '../data/sample-data';
import type { Expense } from '../types/models';
import { THEME_KEY } from '../utils/theme';
import { STORAGE_KEY } from '../store/persistence';

function setup(expenses = sampleData.expenses) {
  const store = createAppStore(expenses);
  const view = render(<Provider store={store}><MemoryRouter><App /></MemoryRouter></Provider>);
  return { ...view, store, user:userEvent.setup() };
}
beforeEach(() => { localStorage.clear(); delete document.documentElement.dataset.theme; });
it('toggles light/dark attributes and persists across remounts without changing finances', async () => {
  const { user, store, unmount } = setup();
  const before = store.getState();
  const toggle = screen.getByRole('button',{name:'Dark mode'});
  expect(toggle).toHaveAttribute('aria-pressed','false');
  expect(document.documentElement).toHaveAttribute('data-theme','light');
  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-pressed','true');
  expect(document.documentElement).toHaveAttribute('data-theme','dark');
  expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  expect(store.getState()).toBe(before);
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  unmount();
  const again = setup();
  expect(document.documentElement).toHaveAttribute('data-theme','dark');
  await again.user.click(screen.getByRole('button',{name:'Dark mode'}));
  expect(document.documentElement).toHaveAttribute('data-theme','light');
  expect(localStorage.getItem(THEME_KEY)).toBe('light');
});
it('falls back for invalid themes and tolerates storage read failures', () => {
  localStorage.setItem(THEME_KEY,'invalid');
  const view = setup();
  expect(document.documentElement).toHaveAttribute('data-theme','light');
  view.unmount();
  vi.spyOn(Storage.prototype,'getItem').mockImplementation(() => { throw new Error('Unavailable'); });
  setup();
  expect(document.documentElement).toHaveAttribute('data-theme','light');
});
it('keeps toggling usable and explains a theme persistence failure', async () => {
  const {user} = setup();
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(() => { throw new Error('Quota'); });
  await user.click(screen.getByRole('button',{name:'Dark mode'}));
  expect(document.documentElement).toHaveAttribute('data-theme','dark');
  expect(screen.getByRole('status')).toHaveTextContent('preference could not be saved');
});
it('opens a member with all expenses even when the table is filtered, and restores focus on close', async () => {
  const {user}=setup();
  await user.selectOptions(screen.getByLabelText('Category filter'),'Other');
  const trigger = screen.getByRole('button',{name:'View Aarav’s financial breakdown'});
  await user.click(trigger);
  const dialog = screen.getByRole('dialog',{name:'Aarav’s financial breakdown'});
  for (const expense of sampleData.expenses) expect(within(dialog).getByRole('heading',{name:expense.description})).toBeVisible();
  expect(within(dialog).getByText('gets back ₹18,554.20')).toBeVisible();
  const close = within(dialog).getByRole('button',{name:'Close'});
  expect(close).toHaveFocus();
  await user.tab();
  expect(close).toHaveFocus();
  await user.tab({shift:true});
  expect(close).toHaveFocus();
  expect(within(dialog).getByText('Scuba diving').closest('article')).toHaveTextContent('No financial involvement');
  const villa=within(dialog).getByText('Villa booking').closest('article');
  if (!villa) throw new Error('Missing villa');
  expect(villa).toHaveTextContent('₹24,000.00');
  expect(villa).toHaveTextContent('₹4,800.00');
  expect(villa).toHaveTextContent('+₹19,200.00');
  await user.click(within(dialog).getByRole('button',{name:'Close'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
it('opens an expense with metadata and all five shares, including an excluded payer', async () => {
  const example:Expense={id:'demo',description:'Lunch for two',amount:10000,paidBy:'m4',date:'2026-03-15',category:'Food',split:{type:'equal',memberIds:['m1','m2']}};
  const {user}=setup([example]);
  await user.click(screen.getByRole('button',{name:'View Lunch for two details'}));
  const dialog=screen.getByRole('dialog',{name:'Lunch for two'});
  expect(dialog).toHaveTextContent('Equally, 2 people');
  expect(dialog).toHaveTextContent('2026-03-15');
  expect(dialog).toHaveTextContent('Food');
  const expectations: [string, string][] = [['Aarav','−₹50.00'],['Diya','−₹50.00'],['Meera','+₹100.00'],['Kabir','₹0.00'],['Rohan','₹0.00']];
  for (const [name,net] of expectations) {
    const card=within(dialog).getByRole('heading',{name}).closest('article');
    if (!card) throw new Error('Missing contribution');
    expect(card).toHaveTextContent(net);
    if(name==='Meera') { expect(card).toHaveTextContent('In splitNo'); expect(card).toHaveTextContent('Share owed₹0.00'); expect(card).toHaveTextContent('Is owed money'); }
    if(name==='Kabir' || name==='Rohan') expect(card).toHaveTextContent('No financial involvement');
  }
  expect(dialog).toHaveTextContent('Net contributions total: ₹0.00');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('opens details by clicking a row, and deletion does not open them', async () => {
  const {user}=setup();
  const row = screen.getByText('Airport cab').closest('tr');
  if(!row) throw new Error('Missing row');
  await user.click(row);
  expect(screen.getByRole('dialog',{name:'Airport cab'})).toHaveTextContent('Percentages');
  await user.click(screen.getByRole('button',{name:'Close'}));
  vi.spyOn(window,'confirm').mockReturnValue(true);
  await user.click(screen.getByRole('button',{name:'Delete Airport cab'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText('Airport cab')).not.toBeInTheDocument();
});
it('shows exact shares and a participating payer separately', async () => {
  const {user}=setup();
  await user.click(screen.getByRole('button',{name:'View Scuba diving details'}));
  const dialog=screen.getByRole('dialog',{name:'Scuba diving'});
  expect(dialog).toHaveTextContent('Exact amounts');
  const kabir=within(dialog).getByRole('heading',{name:'Kabir'}).closest('article');
  if(!kabir) throw new Error('Missing Kabir');
  expect(kabir).toHaveTextContent('Amount paid₹10,500.00');
  expect(kabir).toHaveTextContent('Share owed₹3,500.00');
  expect(kabir).toHaveTextContent('+₹7,000.00');
  await user.click(within(dialog).getByRole('button',{name:'Close'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('lets keyboard users open member details and shows an empty member breakdown', async () => {
  const {user}=setup([]);
  const trigger=screen.getByRole('button',{name:'View Diya’s financial breakdown'});
  trigger.focus();
  await user.keyboard('{Enter}');
  const dialog=screen.getByRole('dialog',{name:'Diya’s financial breakdown'});
  expect(dialog).toHaveTextContent('No expenses recorded');
  expect(dialog).toHaveTextContent('Sum of contributions: ₹0.00');
  await user.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
});
