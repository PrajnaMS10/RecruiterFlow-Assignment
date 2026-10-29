import { useRef,useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { categories,type Errors,type FormValues } from '../types/models';
import { Field } from '../components/Field';
import { addExpense,useAppDispatch,useAppSelector } from '../store/store';
import { initialForm,remaining,today,validate } from '../utils/validation';
export function AddExpensePage() {
  const members=useAppSelector(state => state.trip.members);
  const [values,setValues]=useState(() => initialForm(members));
  const [errors,setErrors]=useState<Errors>({});
  const form=useRef<HTMLFormElement>(null);
  const dispatch=useAppDispatch();
  const navigate=useNavigate();
  function update<K extends keyof FormValues>(key: K,value: FormValues[K]) { setValues(previous => ({ ...previous,[key]: value })); }
  function attributes(id: string) { return { id,'aria-invalid': Boolean(errors[id]),'aria-describedby': errors[id]? `${id}-error`:undefined }; }
  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">KEEP THE TRIP IN BALANCE</p>
        <h1 tabIndex={-1}>Add an expense</h1>
        <p className="muted">Record what you paid. We’ll handle the split.</p>
      </div>
    </div>
    <form className="panel expense-form" ref={form} noValidate onSubmit={event => {
      event.preventDefault();
      const result=validate(values,members);
      setErrors(result.errors);
      if(result.expense) {
        dispatch(addExpense({ ...result.expense,id: crypto.randomUUID() }));
        navigate('/',{ state: { saved: true } });
      }
      else
        requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    }}>
      <h2>Expense details</h2>
      <Field id="description" label="Description" error={errors.description}>
        <input {...attributes('description')} value={values.description} onChange={e => update('description',e.target.value)} placeholder="e.g. Dinner by the beach" />
      </Field>
      <div className="form-grid">
        <Field id="amount" label="Amount (₹)" error={errors.amount}>
          <input {...attributes('amount')} inputMode="decimal" value={values.amount} onChange={e => update('amount',e.target.value)} placeholder="0.00" />
        </Field>
        <Field id="paidBy" label="Paid by" error={errors.paidBy}>
          <select {...attributes('paidBy')} value={values.paidBy} onChange={e => update('paidBy',e.target.value)}>
            <option value="">Select a member</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        </Field>
        <Field id="date" label="Date" error={errors.date}>
          <input {...attributes('date')} type="date" max={today()} value={values.date} onChange={e => update('date',e.target.value)} />
        </Field>
        <Field id="category" label="Category" error={errors.category}>
          <select {...attributes('category')} value={values.category} onChange={e => update('category',e.target.value)}>
            <option value="">Select a category</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
        </Field>
      </div>
      <fieldset tabIndex={-1} aria-invalid={Boolean(errors.split)} aria-describedby={errors.split? "split-error":undefined}>
        <legend>How should this be split?</legend>
        <div className="split-methods">{([{ value: 'equal',label: 'Equal' },{ value: 'exact',label: 'Exact amounts' },{ value: 'percent',label: 'Percentages' }] satisfies {
          value: FormValues['method'];
          label: string;
        }[]).map(method => <label key={method.value}>
          <input type="radio" name="method" checked={values.method===method.value} onChange={() => update('method',method.value)} />{method.label}</label>)}</div>
        <p className="muted">{values.method==='equal'? 'Select everyone sharing this expense. The payer can be left out.':'Enter a share for every member; use 0 for anyone not sharing.'}</p>{members.map(member => values.method==='equal'? <label className="member-row" key={member.id}>
          <input type="checkbox" checked={values.selected.includes(member.id)} onChange={e => update('selected',e.target.checked? [...values.selected,member.id]:values.selected.filter(id => id!==member.id))} />{member.name}</label>:<Field key={member.id} id={`share-${member.id}`} label={`${member.name} ${values.method==='percent'? '(%)':'(₹)'}`} error={errors[`share-${member.id}`]}>
          <input {...attributes(`share-${member.id}`)} inputMode="decimal" value={values.shares[member.id]??''} onChange={e => update('shares',{ ...values.shares,[member.id]: e.target.value })} />
        </Field>)}{values.method!=='equal'&&<p aria-live="polite">{remaining(values)}</p>}{errors.split&&<p id="split-error" role="alert" className="error">{errors.split}</p>}</fieldset>
      <div className="form-actions">
        <Link className="secondary button" to="/">Cancel</Link>
        <button type="submit">Save expense</button>
      </div>
    </form>
  </>;
}
