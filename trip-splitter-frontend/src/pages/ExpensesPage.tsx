import { useState } from 'react';
import { Link,useLocation } from 'react-router-dom';
import { MemberDetails, ExpenseDetails } from '../components/FinancialDetails';
import { categories } from '../types/models';
import { deleteExpense,useAppDispatch,useAppSelector } from '../store/store';
import { balances,describeSplit,formatMoney,sum } from '../utils/money';
export function ExpensesPage() {
  const { members,expenses }=useAppSelector(state => state.trip);
  const dispatch=useAppDispatch();
  const location=useLocation();
  const [category,setCategory]=useState('');
  const [deleted,setDeleted]=useState(false);
  const [detail, setDetail] = useState<{ type: 'member' | 'expense'; id: string } | null>(null);
  const selectedMember = detail?.type === 'member' ? members.find(m => m.id === detail.id) : undefined;
  const selectedExpense = detail?.type === 'expense' ? expenses.find(e => e.id === detail.id) : undefined;
  const visible=expenses.filter(e => !category||e.category===category).toSorted((a,b) => b.date.localeCompare(a.date));
  const balance=balances(members,expenses);
  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">GOA · MARCH 2026</p>
        <h1 tabIndex={-1}>Good memories. Clear balances.</h1>
        <p className="muted">All your shared expenses, in one place.</p>
      </div>
      <Link className="button" to="/expenses/new">+ Add expense</Link>
    </div>{location.state?.saved&&<p className="notice" role="status">Expense added successfully.</p>}{deleted&&<p className="notice" role="status">Expense deleted. Balances updated.</p>}<section aria-labelledby="balances-title">
      <h2 id="balances-title">Group balances</h2>
      <div className="balances">{members.map(member => {
        const value=balance[member.id]??0;
        return <article className="balance-card" key={member.id} onClick={() => setDetail({ type: 'member', id: member.id })}>
          <span className="avatar">{member.name[0]}</span>
          <h3 aria-label={member.name}><button type="button" className="balance-trigger" aria-label={`View ${member.name}’s financial breakdown`} onClick={() => setDetail({ type: 'member', id: member.id })}>{member.name}</button></h3>
          <p className={value>0? 'positive':value<0? 'negative':''}>{value>0? `gets back ${formatMoney(value)}`:value<0? `owes ${formatMoney(-value)}`:'settled up'}</p>
        <span className="detail-hint">View breakdown →</span></article>;
      })}</div>
    </section>
    <section className="panel" aria-labelledby="expenses-title">
      <div className="table-heading">
        <div>
          <h2 id="expenses-title">Trip expenses</h2>
          <p className="muted">{visible.length} expenses · Total shown <strong data-testid="filtered-total">{formatMoney(sum(visible.map(e => e.amount)))}</strong>
          </p>
        </div>
        <div className="field">
          <label htmlFor="filter">Category filter</label>
          <select id="filter" value={category} onChange={event => setCategory(event.target.value)}>
            <option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
        </div>
      </div>{visible.length? <div className="table-scroll" role="region" aria-label="Expenses table" tabIndex={0}>
        <table>
          <thead>
            <tr>{['Date','Description','Category','Paid by','Amount','Split','Actions'].map(title => <th key={title} scope="col">{title}</th>)}</tr>
          </thead>
          <tbody>{visible.map(expense => <tr key={expense.id} className="expense-row" onClick={() => setDetail({ type: 'expense', id: expense.id })}>
            <td>
              <time dateTime={expense.date}>{expense.date}</time>
            </td>
            <td>
              <button type="button" className="expense-trigger" aria-label={`View ${expense.description} details`} onClick={() => setDetail({ type: 'expense', id: expense.id })}>{expense.description}</button>
            </td>
            <td>
              <span className="tag">{expense.category}</span>
            </td>
            <td>{members.find(m => m.id===expense.paidBy)?.name}</td>
            <td className="money">{formatMoney(expense.amount)}</td>
            <td>{describeSplit(expense.split)}</td>
            <td>
              <button className="delete" aria-label={`Delete ${expense.description}`} onClick={event => {
                event.stopPropagation();
                if(window.confirm(`Delete “${expense.description}”? This updates everyone’s balance.`)) {
                  dispatch(deleteExpense(expense.id));
                  setDeleted(true);
                }
              }}>Delete</button>
            </td>
          </tr>)}</tbody>
        </table>
      </div>:<div className="empty">
        <h3>{expenses.length? 'No expenses in this category':'Your trip starts with a clean slate'}</h3>
        <p>Add an expense to keep track of what everyone paid.</p>
        <Link to="/expenses/new">Add an expense</Link>
      </div>}</section>
    {selectedMember && <MemberDetails member={selectedMember} members={members} expenses={expenses} onClose={() => setDetail(null)} />}
    {selectedExpense && <ExpenseDetails expense={selectedExpense} members={members} onClose={() => setDetail(null)} />}
  </>;
}
