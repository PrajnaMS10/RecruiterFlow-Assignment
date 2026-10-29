import { useEffect,useState } from 'react';
import { Link,NavLink,Route,Routes,useLocation } from 'react-router-dom';
import { ExpensesPage } from './pages/ExpensesPage';
import { ThemeToggle } from './components/ThemeToggle';
import { AddExpensePage } from './pages/AddExpensePage';
export function App() {
  const [storageFailed,setStorageFailed]=useState(false);
  const location=useLocation();
  useEffect(() => {
    const handle=(event: Event) => {
      if(event instanceof CustomEvent)
        setStorageFailed(event.detail===true);
    };
    window.addEventListener('trip-storage',handle);
    return () => window.removeEventListener('trip-storage',handle);
  },[]);
  // Move focus to the new page title after client-side navigation.
  useEffect(() => {
    document.querySelector<HTMLElement>('h1')?.focus();
  },[location.pathname]);
  return (<>
    <header>
      <Link className="brand" to="/">↗ Trip Splitter <span>GOA ’26</span>
      </Link>
      <div className="header-actions"><nav aria-label="Main navigation">
        <NavLink to="/" end>Expenses</NavLink>
        <NavLink to="/expenses/new">Add expense</NavLink>
      </nav><ThemeToggle /></div>
    </header>
    <main>
      {storageFailed&&(<p role="alert" className="error">
        Your browser could not save changes. Keep this tab open; changes may be lost on reload.
      </p>)}
      <Routes>
        <Route path="/" element={<ExpensesPage />} />
        <Route path="/expenses/new" element={<AddExpensePage />} />
        <Route path="*" element={<section className="panel">
          <h1 tabIndex={-1}>Page not found</h1>
          <Link to="/">Back to Expenses</Link>
        </section>} />
      </Routes>
    </main>
    <footer>Five friends. One great trip. Every paisa accounted for.</footer>
  </>);
}
