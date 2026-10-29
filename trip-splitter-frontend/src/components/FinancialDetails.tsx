import type { Expense, Member } from '../types/models';
import { balanceLabel, contributionExplanation, describeSplit, expenseBreakdown, formatMoney, memberBreakdown, signedMoney, type Contribution } from '../utils/money';
import { DetailDialog } from './DetailDialog';

function ContributionValues({ contribution }: { contribution: Contribution }) {
  return <>
    <dl className="contribution-values">
      <div><dt>In split</dt><dd>{contribution.participated ? 'Yes' : 'No'}</dd></div>
      <div><dt>Amount paid</dt><dd>{formatMoney(contribution.paid)}</dd></div>
      <div><dt>Share owed</dt><dd>{formatMoney(contribution.share)}</dd></div>
      <div><dt>Net contribution</dt><dd className={contribution.net > 0 ? 'positive' : contribution.net < 0 ? 'negative' : ''}>{signedMoney(contribution.net)}</dd></div>
    </dl>
    <p>{contributionExplanation(contribution)}</p>
    <p className="muted">{balanceLabel(contribution.net)}</p>
  </>;
}

const explanation = 'Amount paid minus share owed equals net contribution. Positive means money back; negative means money owed. These balances do not specify direct repayments between people.';

export function MemberDetails({ member, members, expenses, onClose }: { member: Member; members: Member[]; expenses: Expense[]; onClose: () => void }) {
  const breakdown = memberBreakdown(member, expenses);
  return <DetailDialog title={`${member.name}’s financial breakdown`} onClose={onClose}>
    <p className="detail-total">Overall balance: <strong>{balanceLabel(breakdown.balance)}</strong> <span>({signedMoney(breakdown.balance)})</span></p>
    <p className="muted">{explanation}</p>
    <p>All {expenses.length} recorded expenses, independent of the category filter.</p>
    <div className="detail-list">{breakdown.entries.map(entry => <article className="detail-item" key={entry.expense.id}>
      <h3>{entry.expense.description}</h3>
      <p className="muted"><time dateTime={entry.expense.date}>{entry.expense.date}</time> · Total {formatMoney(entry.expense.amount)} · Paid by {members.find(m => m.id === entry.expense.paidBy)?.name}</p>
      <ContributionValues contribution={entry} />
    </article>)}</div>
    {!expenses.length && <p>No expenses recorded. This member is settled up.</p>}
    <p className="detail-total">Sum of contributions: <strong>{signedMoney(breakdown.balance)}</strong></p>
  </DetailDialog>;
}

export function ExpenseDetails({ expense, members, onClose }: { expense: Expense; members: Member[]; onClose: () => void }) {
  const { entries: contributions, totalShares, net } = expenseBreakdown(members, expense);
  return <DetailDialog title={expense.description} onClose={onClose}>
    <dl className="expense-metadata">
      <div><dt>Date</dt><dd><time dateTime={expense.date}>{expense.date}</time></dd></div>
      <div><dt>Category</dt><dd>{expense.category}</dd></div>
      <div><dt>Total amount</dt><dd>{formatMoney(expense.amount)}</dd></div>
      <div><dt>Paid by</dt><dd>{members.find(m => m.id === expense.paidBy)?.name}</dd></div>
      <div><dt>Split type</dt><dd>{describeSplit(expense.split)}</dd></div>
    </dl>
    <p className="muted">{explanation}</p>
    <div className="detail-list">{contributions.map(contribution => <article className="detail-item" key={contribution.member.id}>
      <h3>{contribution.member.name}</h3>
      <ContributionValues contribution={contribution} />
    </article>)}</div>
    <p className="detail-total">Total shares: <strong>{formatMoney(totalShares)}</strong></p>
    <p className="detail-total">Net contributions total: <strong>{signedMoney(net)}</strong> · Balanced</p>
  </DetailDialog>;
}
