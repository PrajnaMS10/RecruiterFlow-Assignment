import { beforeEach,expect,it,vi } from 'vitest';
import { render,screen,within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { createAppStore } from '../store/store';
import { sampleData } from '../data/sample-data';
import { STORAGE_KEY } from '../store/persistence';
function setup(route='/') {
  const store=createAppStore(sampleData.expenses);
  render(<Provider store={store}>
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  </Provider>);
  return { store,user: userEvent.setup() };
}
beforeEach(() => localStorage.clear());
it('shows every invalid field without changing state or storage',async () => {
  const { store,user }=setup('/expenses/new'); await user.clear(screen.getByLabelText('Date')); for(const m of sampleData.members)
    await user.click(screen.getByLabelText(m.name)); await user.click(screen.getByRole('button',{ name: 'Save expense' })); expect(screen.getByText('Description is required')).toBeVisible(); expect(screen.getByText('Amount is required')).toBeVisible(); expect(screen.getByText('Paid by is required')).toBeVisible(); expect(screen.getByText('Category is required')).toBeVisible(); expect(screen.getByText('Choose a valid date that is not in the future')).toBeVisible(); expect(screen.getByText('Select at least one member')).toBeVisible(); expect(store.getState().trip.expenses).toHaveLength(6); expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
it.each(['Equal','Exact amounts','Percentages'])('saves a valid %s expense and navigates home',async (method) => {
  const { store,user }=setup('/expenses/new'); await user.type(screen.getByLabelText('Description'),'Sunset lunch'); await user.type(screen.getByLabelText('Amount (₹)'),'100'); await user.selectOptions(screen.getByLabelText('Paid by'),'m5'); await user.selectOptions(screen.getByLabelText('Category'),'Food'); await user.click(screen.getByLabelText(method)); if(method!=='Equal') {
    const label=method==='Percentages'? 'Aarav (%)':'Aarav (₹)';
    await user.clear(screen.getByLabelText(label));
    await user.type(screen.getByLabelText(label),'100');
  } await user.click(screen.getByRole('button',{ name: 'Save expense' })); expect(await screen.findByText('Expense added successfully.')).toBeVisible(); expect(screen.getByText('Sunset lunch')).toBeVisible(); expect(store.getState().trip.expenses).toHaveLength(7); expect(JSON.parse(localStorage.getItem(STORAGE_KEY)??'[]')).toHaveLength(7);
});
it('filters expenses and displayed total',async () => { const { user }=setup(); expect(screen.getByTestId('filtered-total')).toHaveTextContent('₹42,249.99'); await user.selectOptions(screen.getByLabelText('Category filter'),'Food'); expect(screen.getByText('Groceries')).toBeVisible(); expect(screen.queryByText('Villa booking')).not.toBeInTheDocument(); expect(screen.getByTestId('filtered-total')).toHaveTextContent('₹4,250.00'); await user.selectOptions(screen.getByLabelText('Category filter'),'Other'); expect(screen.getByText('No expenses in this category')).toBeVisible(); expect(screen.getByTestId('filtered-total')).toHaveTextContent('₹0.00'); });
it('confirms deletion and immediately updates balances',async () => {
  const { store,user }=setup(); const confirm=vi.spyOn(window,'confirm').mockReturnValue(false); await user.click(screen.getByRole('button',{ name: 'Delete Villa booking' })); expect(screen.getByText('Villa booking')).toBeVisible(); confirm.mockReturnValue(true); await user.click(screen.getByRole('button',{ name: 'Delete Villa booking' })); expect(screen.queryByText('Villa booking')).not.toBeInTheDocument(); expect(store.getState().trip.expenses).toHaveLength(5); const aarav=screen.getByRole('heading',{ name: 'Aarav' }).closest('article'); if(!aarav)
    throw new Error('Missing balance card'); expect(within(aarav).getByText('owes ₹645.80')).toBeVisible();
});
it('cancel leaves state alone',async () => { const { user,store }=setup('/expenses/new'); await user.type(screen.getByLabelText('Description'),'Unsaved'); await user.click(screen.getByRole('link',{ name: 'Cancel' })); expect(screen.getByRole('heading',{ name: 'Trip expenses' })).toBeVisible(); expect(store.getState().trip.expenses).toHaveLength(6); });
it('renders unknown routes and a working return link',async () => { const { user }=setup('/missing'); expect(screen.getByRole('heading',{ name: 'Page not found' })).toBeVisible(); await user.click(screen.getByRole('link',{ name: 'Back to Expenses' })); expect(screen.getByRole('heading',{ name: 'Trip expenses' })).toBeVisible(); });
