import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, Check, ChevronRight, CircleDollarSign, CreditCard, Gem, History, LayoutDashboard, Plus, RotateCcw, Settings2, Target, TrendingUp, X } from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import './index.css';

type SavingMethod = 'roundUp' | 'autoSave';
type InvestmentType = 'digitalGold' | 'mutualFund' | null;
type AutoSaveFrequency = 'weekly' | 'monthly';
type TimeHorizon = 1 | 3 | 5;

type Transaction = {
  id: string;
  amount: number;
  roundUpAmount: number;
  timestamp: string;
  savingMethod: SavingMethod;
};

type SavingsData = {
  savingMethod: SavingMethod;
  roundUpTarget: 5 | 10 | 15 | 20;
  autoSaveAmount: number;
  autoSaveFrequency: AutoSaveFrequency;
  transactions: Transaction[];
  totalSaved: number;
  investmentType: InvestmentType;
  investmentAmount: number;
  timeHorizon: TimeHorizon;
  projectedValue: number;
  simulatedReturnRate: number;
  redeemed: boolean;
};

const STORAGE_KEY = 'roundnest-simulation-v1';
const THRESHOLD = 100;
const PROJECTION_ASSUMPTIONS = {
  digitalGold: { label: 'Digital Gold', rate: 0.065, note: 'A steadier illustrative path' },
  mutualFund: { label: 'Mutual Fund', rate: 0.105, note: 'A longer-view illustrative path' },
} as const;

const defaultData: SavingsData = {
  savingMethod: 'roundUp',
  roundUpTarget: 10,
  autoSaveAmount: 50,
  autoSaveFrequency: 'weekly',
  transactions: [],
  totalSaved: 0,
  investmentType: null,
  investmentAmount: 100,
  timeHorizon: 3,
  projectedValue: 121.9,
  simulatedReturnRate: 0.065,
  redeemed: false,
};

function loadData(): SavingsData {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultData;
    const parsed = JSON.parse(stored) as Partial<SavingsData>;
    return { ...defaultData, ...parsed, transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [] };
  } catch {
    return defaultData;
  }
}

function formatINR(value: number, decimals = 0) {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function roundUpFor(amount: number, target: number) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const remainder = amount % target;
  return remainder === 0 ? 0 : target - remainder;
}

function projectionFor(amount: number, type: Exclude<InvestmentType, null>, horizon: TimeHorizon) {
  const rate = PROJECTION_ASSUMPTIONS[type].rate;
  return Number((amount * Math.pow(1 + rate, horizon)).toFixed(2));
}

function useSavingsData() {
  const [data, setData] = useState<SavingsData>(loadData);
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) ? new Date() : null;
    } catch {
      return null;
    }
  });

  const saveData = (update: SavingsData | ((previous: SavingsData) => SavingsData)) => {
    setData((previous) => {
      const next = typeof update === 'function' ? update(previous) : update;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // The interface continues to work if browser storage is unavailable.
      }
      setLastSaved(new Date());
      return next;
    });
  };

  return { data, saveData, lastSaved };
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="brand" data-testid="link-brand" style={light ? { color: '#26243c' } : undefined}>
      <span className="brand-mark" aria-hidden="true" />
      <span>RoundNest</span>
    </Link>
  );
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: History },
  { href: '/investment', label: 'Investment', icon: TrendingUp },
];

function AppSidebar() {
  const [location] = useLocation();
  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <Brand />
      <div className="sidebar-tag">A small habit, held</div>
      <div className="side-label">Your nest</div>
      <nav className="side-nav">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link href={href} className={`side-link ${location === href ? 'active' : ''}`} data-testid={`link-${label.toLowerCase()}`} key={href}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
        <Link href="/setup" className={`side-link ${location === '/setup' ? 'active' : ''}`} data-testid="link-settings">
          <Settings2 aria-hidden="true" />
          <span>Saving setup</span>
        </Link>
      </nav>
      <div className="sidebar-foot">
        <div className="local-note">
          <strong>Stored on this device</strong>
          No accounts, transfers, or cloud sync. Your simulation stays in this browser.
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  const [location] = useLocation();
  return (
    <header className="mobile-top">
      <Brand />
      <nav className="mobile-menu" aria-label="Mobile navigation">
        {navItems.map(({ href, label }) => (
          <Link href={href} className={location === href ? 'active' : ''} data-testid={`mobile-link-${label.toLowerCase()}`} key={href}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="main-area">
        <MobileNav />
        {children}
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Brand light />
        <span className="brand-meta">A quiet savings simulation</span>
      </header>
      <section className="hero">
        <div className="animate-rise">
          <div className="eyebrow">Micro-investing, made tangible</div>
          <h1>Let the little things <em>gather.</em></h1>
          <p className="hero-copy">RoundNest turns spare change and gentle routines into a visual journey toward your first simulated investment. No bank connection. No promises. Just a better way to notice progress.</p>
          <div className="hero-actions">
            <Link href="/setup" className="button-primary" data-testid="link-start-saving">
              Start saving <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className="text-link" data-testid="link-how-it-works">See how it works <ChevronRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="hero-art animate-pulse-soft" aria-label="Abstract illustration of a nest holding a growing seed">
          <div className="orbit">
            <div className="orbit-core"><span className="orbit-dot" /></div>
            <span className="orbit-dot" />
          </div>
          <span className="hero-note">small steps / real feeling</span>
        </div>
      </section>
      <div className="landing-strip">
        <span>Local by design</span>
        <span>Illustrative only</span>
        <span>Built for first milestones</span>
      </div>
      <section className="dark-panel" id="how-it-works">
        <div className="eyebrow" style={{ color: '#aaa8b8' }}>The RoundNest way</div>
        <h2>Make a habit you can <em>see.</em></h2>
        <div className="principles">
          <article className="principle">
            <div className="principle-number">01 / NOTICE</div>
            <h3>Catch the spare change</h3>
            <p>Log an everyday purchase and watch the small round-up become part of a visible total.</p>
          </article>
          <article className="principle">
            <div className="principle-number">02 / GATHER</div>
            <h3>Reach your first ₹100</h3>
            <p>A threshold that feels close enough to touch, with a progress path that moves when you do.</p>
          </article>
          <article className="principle">
            <div className="principle-number">03 / IMAGINE</div>
            <h3>Explore what comes next</h3>
            <p>Choose a simulated destination and a time horizon. Explore the numbers without pretending they are promises.</p>
          </article>
        </div>
      </section>
      <footer className="landing-footer">
        <span>RoundNest / 2025</span>
        <span>Made for the almosts</span>
      </footer>
    </main>
  );
}

function SetupPage({ data, saveData }: { data: SavingsData; saveData: (update: SavingsData | ((previous: SavingsData) => SavingsData)) => void }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<SavingMethod>(data.savingMethod);
  const [target, setTarget] = useState<5 | 10 | 15 | 20>(data.roundUpTarget);
  const [amount, setAmount] = useState(String(data.autoSaveAmount));
  const [frequency, setFrequency] = useState<AutoSaveFrequency>(data.autoSaveFrequency);
  const [destination, setDestination] = useState<InvestmentType>(data.investmentType);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const goNext = () => {
    setError('');
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2 && method === 'autoSave') {
      const parsed = Number(amount);
      if (!amount.trim() || !Number.isFinite(parsed) || parsed <= 0 || parsed > 100000) {
        setError('Choose a savings amount between ₹1 and ₹1,00,000.');
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const parsed = Number(amount);
    saveData((previous) => ({
      ...previous,
      savingMethod: method,
      roundUpTarget: target,
      autoSaveAmount: Number.isFinite(parsed) && parsed > 0 ? parsed : previous.autoSaveAmount,
      autoSaveFrequency: frequency,
      investmentType: destination,
      investmentAmount: destination ? Math.max(100, previous.investmentAmount) : previous.investmentAmount,
      simulatedReturnRate: destination ? PROJECTION_ASSUMPTIONS[destination].rate : previous.simulatedReturnRate,
      projectedValue: destination ? projectionFor(Math.max(100, previous.investmentAmount), destination, previous.timeHorizon) : previous.projectedValue,
    }));
    setLocation('/dashboard');
  };

  return (
    <AppShell>
      <div className="page-wrap form-shell">
        <div className="setup-header">
          <Link href="/dashboard" className="text-link" data-testid="link-setup-back"><ArrowLeft size={14} aria-hidden="true" /> Back to nest</Link>
          <div className="steps" aria-label={`Setup step ${step} of 3`}>
            {[1, 2, 3].map((number) => <span className={`step ${step >= number ? 'active' : ''}`} key={number} />)}
          </div>
        </div>
        <section className="setup-panel animate-rise">
          <div className="eyebrow">Step {step} of 3</div>
          {step === 1 && (
            <>
              <h1>How should the nest begin?</h1>
              <p>Pick the rhythm that feels natural. You can change your choice any time, and every entry stays a simulation on this device.</p>
              <div className="choice-grid">
                <button type="button" className={`choice ${method === 'roundUp' ? 'selected' : ''}`} onClick={() => setMethod('roundUp')} data-testid="choice-round-up">
                  <CircleDollarSign className="choice-icon" size={22} aria-hidden="true" />
                  <strong>Round up purchases</strong>
                  <span>Turn the distance to the next ₹{target} into a tiny saving moment.</span>
                </button>
                <button type="button" className={`choice ${method === 'autoSave' ? 'selected' : ''}`} onClick={() => setMethod('autoSave')} data-testid="choice-auto-save">
                  <CalendarDays className="choice-icon" size={22} aria-hidden="true" />
                  <strong>Set an auto-save rhythm</strong>
                  <span>Choose a recurring amount and let your future self meet it.</span>
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h1>{method === 'roundUp' ? 'Set your round-up distance.' : 'Choose a rhythm you can keep.'}</h1>
              <p>{method === 'roundUp' ? 'A smaller target makes more frequent nudges. A bigger one gathers faster. There is no wrong pace.' : 'This is a reminder for the simulation, not a bank instruction. Keep it light enough to feel repeatable.'}</p>
              {method === 'roundUp' ? (
                <div className="form-section">
                  <span className="option-label">Round purchases up to</span>
                  <div className="amount-options">
                    {[5, 10, 15, 20].map((value) => (
                      <button type="button" key={value} className={`amount-option ${target === value ? 'selected' : ''}`} onClick={() => setTarget(value as 5 | 10 | 15 | 20)} data-testid={`choice-target-${value}`}>₹{value}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="form-section">
                  <label className="option-label" htmlFor="auto-save-amount">Amount per rhythm <small>in rupees</small></label>
                  <input id="auto-save-amount" className="field" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="50" data-testid="input-auto-save-amount" />
                  {error && <div className="field-error" role="alert" data-testid="error-auto-save-amount">{error}</div>}
                  <div className="form-section">
                    <span className="option-label">Repeat</span>
                    <div className="amount-options">
                      {(['weekly', 'monthly'] as const).map((value) => (
                        <button type="button" key={value} className={`amount-option ${frequency === value ? 'selected' : ''}`} onClick={() => setFrequency(value)} data-testid={`choice-frequency-${value}`}>{value === 'weekly' ? 'Weekly' : 'Monthly'}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <h1>Give the milestone a horizon.</h1>
              <p>This part is optional. Choose a simulated destination now, or leave it open until your nest reaches ₹100.</p>
              <div className="choice-grid">
                <button type="button" className={`choice ${destination === 'digitalGold' ? 'selected' : ''}`} onClick={() => setDestination(destination === 'digitalGold' ? null : 'digitalGold')} data-testid="choice-digital-gold">
                  <Gem className="choice-icon" size={22} aria-hidden="true" />
                  <strong>Digital Gold</strong>
                  <span>Illustrate a precious-material path with a gentler assumption.</span>
                </button>
                <button type="button" className={`choice ${destination === 'mutualFund' ? 'selected' : ''}`} onClick={() => setDestination(destination === 'mutualFund' ? null : 'mutualFund')} data-testid="choice-mutual-fund">
                  <BarChart3 className="choice-icon" size={22} aria-hidden="true" />
                  <strong>Mutual Fund</strong>
                  <span>Illustrate a long-view path with a different assumption.</span>
                </button>
              </div>
              <div className="review-box">
                <div className="review-line"><span>Saving mode</span><strong>{method === 'roundUp' ? `Round up to ₹${target}` : `${formatINR(Number(amount) || 0)} / ${frequency}`}</strong></div>
                <div className="review-line"><span>Destination</span><strong>{destination ? PROJECTION_ASSUMPTIONS[destination].label : 'Decide later'}</strong></div>
                <div className="review-line"><span>What happens next</span><strong>Dashboard opens</strong></div>
              </div>
            </>
          )}
          <div className="setup-footer">
            {step > 1 ? <button type="button" className="button-quiet" onClick={() => { setError(''); setStep(step - 1); }} data-testid="button-setup-previous"><ArrowLeft size={14} aria-hidden="true" /> Previous</button> : <span className="subtle-note">Stored only in your browser.</span>}
            <button type="button" className="button-primary" onClick={goNext} data-testid="button-setup-next">{step === 3 ? 'Open my nest' : 'Continue'} <ArrowRight size={14} aria-hidden="true" /></button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function AddTransactionModal({ data, saveData, onClose }: { data: SavingsData; saveData: (update: SavingsData | ((previous: SavingsData) => SavingsData)) => void; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const contribution = amount && Number(amount) > 0 && data.savingMethod === 'roundUp' ? roundUpFor(Number(amount), data.roundUpTarget) : 0;
  const submit = () => {
    const value = Number(amount);
    if (!amount.trim() || !Number.isFinite(value) || value <= 0 || value > 10000000) {
      setError('Enter a valid purchase amount between ₹1 and ₹1,00,00,000.');
      return;
    }
    const saved = data.savingMethod === 'roundUp' ? roundUpFor(value, data.roundUpTarget) : 0;
    const transaction: Transaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      amount: value,
      roundUpAmount: saved,
      timestamp: new Date().toISOString(),
      savingMethod: data.savingMethod,
    };
    saveData((previous) => ({ ...previous, transactions: [transaction, ...previous.transactions], totalSaved: Number((previous.totalSaved + saved).toFixed(2)) }));
    onClose();
  };
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-transaction-title">
        <div className="modal-head">
          <div><div className="eyebrow">A new little step</div><h2 id="add-transaction-title">Add a purchase</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close add purchase dialog" data-testid="button-close-add-transaction"><X size={17} /></button>
        </div>
        <label className="option-label" htmlFor="transaction-amount">Purchase amount <small>in rupees</small></label>
        <input id="transaction-amount" className="field" inputMode="decimal" autoFocus value={amount} onChange={(event) => { setAmount(event.target.value); setError(''); }} placeholder="237" data-testid="input-transaction-amount" />
        {error && <div className="field-error" role="alert" data-testid="error-transaction-amount">{error}</div>}
        <p>{data.savingMethod === 'roundUp' ? `At a ₹${data.roundUpTarget} target, this adds ${formatINR(contribution)} to your nest.` : 'Auto-save is represented by your schedule. A purchase entry is logged here without an automatic contribution.'}</p>
        <div className="modal-actions">
          <button type="button" className="button-quiet" onClick={onClose} data-testid="button-cancel-add-transaction">Cancel</button>
          <button type="button" className="button-primary" onClick={submit} data-testid="button-save-transaction">Add to nest <Plus size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function LocalStatus({ lastSaved }: { lastSaved: Date | null }) {
  return <span className="subtle-note" data-testid="status-local-storage"><span className="accent-dot" /> {lastSaved ? 'Saved locally just now' : 'Ready to save locally'}</span>;
}

function DashboardPage({ data, saveData, lastSaved }: { data: SavingsData; saveData: (update: SavingsData | ((previous: SavingsData) => SavingsData)) => void; lastSaved: Date | null }) {
  const [showAdd, setShowAdd] = useState(false);
  const progress = Math.min(data.totalSaved / THRESHOLD, 1);
  const latest = data.transactions.slice(0, 4);
  const [, setLocation] = useLocation();
  return (
    <AppShell>
      <div className="page-wrap">
        <div className="content-header">
          <div><div className="eyebrow">Your nest / overview</div><h1 className="page-title">A little, gathered.</h1><p className="page-intro">Small entries have a way of becoming a shape. Keep going at your own pace.</p></div>
          <div className="header-actions"><LocalStatus lastSaved={lastSaved} /><button type="button" className="button-dark" onClick={() => setShowAdd(true)} data-testid="button-add-transaction"><Plus size={15} /> Add purchase</button></div>
        </div>
        <section className="dash-grid">
          <article className="card progress-card card-pad animate-rise">
            <div className="eyebrow">First investment threshold</div>
            <h2 data-testid="text-total-saved">{formatINR(data.totalSaved)} <span>/ ₹100</span></h2>
            <p>{progress >= 1 ? 'Your first threshold is open.' : `${formatINR(Math.max(THRESHOLD - data.totalSaved, 0))} left until your first simulated investment.`}</p>
            <div className="progress-wrap">
              <div className="progress-track" aria-label={`${Math.round(progress * 100)} percent saved`}><div className="progress-fill" style={{ width: `${progress * 100}%` }} /></div>
              <div className="progress-legend"><span>Start</span><span data-testid="text-progress-percentage">{Math.round(progress * 100)}% gathered</span><span>₹100</span></div>
            </div>
          </article>
          <div className="stat-stack">
            <article className="card stat-card card-pad"><div className="eyebrow">Entries logged <span className="accent-dot" /></div><div className="stat-value" data-testid="text-transaction-count">{data.transactions.length}</div><div className="stat-hint">ordinary moments noticed</div></article>
            <article className="card stat-card card-pad"><div className="eyebrow">Nest status <span className="accent-dot" /></div><div className="stat-value" data-testid="text-nest-status">{progress >= 1 ? 'Open' : 'Growing'}</div><div className="stat-hint">simulation, stored locally</div></article>
          </div>
        </section>
        <section className="section-grid">
          <article className="card card-pad">
            <div className="card-heading"><h3>Recent transactions</h3><Link href="/transactions" className="small-link" data-testid="link-view-all-transactions">View all</Link></div>
            {latest.length ? <div className="transaction-list">{latest.map((transaction) => <TransactionRow transaction={transaction} key={transaction.id} />)}</div> : <div className="empty-state"><div><div className="empty-mark"><Plus size={16} /></div><div>No purchases yet. Add the first small step.</div><button type="button" className="small-link" onClick={() => setShowAdd(true)} data-testid="button-empty-add-transaction">Add a purchase</button></div></div>}
          </article>
          <div className="side-cards">
            <article className="card card-pad mode-card">
              <div className="mode-symbol">{data.savingMethod === 'roundUp' ? <CircleDollarSign size={21} /> : <CalendarDays size={21} />}</div>
              <div className="eyebrow">Your saving mode</div>
              <h3>{data.savingMethod === 'roundUp' ? 'Round it gently.' : 'Keep a rhythm.'}</h3>
              <p>{data.savingMethod === 'roundUp' ? `Every purchase rounds to the next ₹${data.roundUpTarget}.` : `${formatINR(data.autoSaveAmount)} saved ${data.autoSaveFrequency}.`}</p>
              <Link href="/setup" className="button-quiet" data-testid="link-change-saving-mode">Change setup <ArrowRight size={13} /></Link>
            </article>
            <article className="card card-pad investment-card" style={{ marginTop: 17 }}>
              <div className="eyebrow">{progress >= 1 ? 'Milestone unlocked' : 'Next horizon'}</div>
              <h3>{progress >= 1 ? data.investmentType ? PROJECTION_ASSUMPTIONS[data.investmentType].label : 'Choose a direction' : 'The first ₹100'}</h3>
              <p>{progress >= 1 ? 'Your illustration is ready when you are.' : 'Once gathered, explore two illustrative paths for your next chapter.'}</p>
              <button type="button" className="button-dark" onClick={() => setLocation('/investment')} data-testid="button-open-investment">{progress >= 1 ? 'View projection' : 'See the path'} <ArrowRight size={13} /></button>
              {progress >= 1 && data.investmentType && <div className="projection-line"><span>Illustrative value</span><strong data-testid="text-dashboard-projection">{formatINR(data.projectedValue, 2)}</strong></div>}
            </article>
          </div>
        </section>
        {showAdd && <AddTransactionModal data={data} saveData={saveData} onClose={() => setShowAdd(false)} />}
      </div>
    </AppShell>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const date = new Date(transaction.timestamp);
  return (
    <div className="transaction-row" data-testid={`row-transaction-${transaction.id}`}>
      <div className="transaction-icon"><CreditCard size={15} /></div>
      <div><div className="transaction-name">Purchase entry</div><div className="transaction-meta">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {transaction.savingMethod === 'roundUp' ? 'Round-up' : 'Auto-save log'}</div></div>
      <div><div className="transaction-amount">{formatINR(transaction.amount)}</div><div className="transaction-save">+{formatINR(transaction.roundUpAmount)}</div></div>
    </div>
  );
}

function TransactionsPage({ data, saveData, lastSaved }: { data: SavingsData; saveData: (update: SavingsData | ((previous: SavingsData) => SavingsData)) => void; lastSaved: Date | null }) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <AppShell>
      <div className="page-wrap">
        <div className="content-header">
          <div><div className="eyebrow">Your nest / record</div><h1 className="page-title">The small stuff.</h1><p className="page-intro">Every entry is a reminder that progress does not need to arrive loudly.</p></div>
          <div className="header-actions"><LocalStatus lastSaved={lastSaved} /><button type="button" className="button-dark" onClick={() => setShowAdd(true)} data-testid="button-transactions-add"><Plus size={15} /> Add purchase</button></div>
        </div>
        <article className="card history-card">
          {data.transactions.length ? (
            <div className="table-scroll">
              <table className="history-table">
                <thead><tr><th>Entry</th><th>Purchase</th><th>Round-up saved</th><th>When</th><th>Method</th></tr></thead>
                <tbody>{data.transactions.map((transaction) => <tr key={transaction.id} data-testid={`table-row-transaction-${transaction.id}`}><td><span className="transaction-icon"><CreditCard size={14} /></span></td><td>{formatINR(transaction.amount)}</td><td className="mono" style={{ color: '#a8495f' }}>+{formatINR(transaction.roundUpAmount)}</td><td>{new Date(transaction.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td><td><span className="method-pill">{transaction.savingMethod === 'roundUp' ? 'Round-up' : 'Auto-save'}</span></td></tr>)}</tbody>
              </table>
            </div>
          ) : <div className="empty-state" style={{ minHeight: 340 }}><div><div className="empty-mark"><History size={17} /></div><strong>Your history is waiting.</strong><div>Log a purchase to make the first mark.</div><button type="button" className="button-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)} data-testid="button-empty-history-add"><Plus size={14} /> Add first purchase</button></div></div>}
        </article>
        {showAdd && <AddTransactionModal data={data} saveData={saveData} onClose={() => setShowAdd(false)} />}
      </div>
    </AppShell>
  );
}

function InvestmentPage({ data, saveData, lastSaved }: { data: SavingsData; saveData: (update: SavingsData | ((previous: SavingsData) => SavingsData)) => void; lastSaved: Date | null }) {
  const [type, setType] = useState<InvestmentType>(data.investmentType);
  const [horizon, setHorizon] = useState<TimeHorizon>(data.timeHorizon);
  const [amount, setAmount] = useState(String(data.investmentAmount || 100));
  const [showRedeem, setShowRedeem] = useState(false);
  const [notice, setNotice] = useState('');
  const [location] = useLocation();
  const unlocked = data.totalSaved >= THRESHOLD;
  const numericAmount = Number(amount) || 0;
  const projected = type ? projectionFor(numericAmount, type, horizon) : 0;
  const saveProjection = () => {
    if (!type || numericAmount < 100) return;
    saveData((previous) => ({ ...previous, investmentType: type, investmentAmount: numericAmount, timeHorizon: horizon, projectedValue: projected, simulatedReturnRate: PROJECTION_ASSUMPTIONS[type].rate }));
    setNotice('Projection saved locally.');
  };
  useEffect(() => {
    if (!unlocked && location === '/investment') setNotice('');
  }, [unlocked, location]);
  return (
    <AppShell>
      <div className="page-wrap">
        <div className="content-header">
          <div><div className="eyebrow">Your nest / next horizon</div><h1 className="page-title">Where could it gather?</h1><p className="page-intro">An illustration for the curious, never a promise for the certain.</p></div>
          <LocalStatus lastSaved={lastSaved} />
        </div>
        <section className="investment-hero">
          <article className={`card card-pad unlock-card ${unlocked ? 'unlocked' : ''}`}>
            <div className="eyebrow">{unlocked ? 'Threshold reached' : 'Still gathering'}</div>
            <h1>{unlocked ? 'Your first door is open.' : `${formatINR(Math.max(THRESHOLD - data.totalSaved, 0))} to go.`}</h1>
            <p>{unlocked ? 'You have reached the first simulated investment threshold. Choose a path below and see how an illustrative horizon changes the shape.' : 'Keep logging small purchases or follow your saving rhythm. At ₹100, the investment room will open.'}</p>
            <div className="unlock-progress"><div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(data.totalSaved / THRESHOLD, 1) * 100}%` }} /></div><div className="progress-legend"><span>{formatINR(data.totalSaved)} gathered</span><span>₹100 threshold</span></div></div>
          </article>
          <article className="card card-pad selection-card">
            <div className="eyebrow">Illustrative projection</div>
            <h2>{unlocked ? 'Choose a direction.' : 'Not open just yet.'}</h2>
            {unlocked ? (
              <>
                <div className="choice-grid">
                  <button type="button" className={`choice ${type === 'digitalGold' ? 'selected' : ''}`} onClick={() => { setType('digitalGold'); setNotice(''); }} data-testid="investment-select-digital-gold"><Gem className="choice-icon" size={18} /><strong>Digital Gold</strong><span>6.5% assumption</span></button>
                  <button type="button" className={`choice ${type === 'mutualFund' ? 'selected' : ''}`} onClick={() => { setType('mutualFund'); setNotice(''); }} data-testid="investment-select-mutual-fund"><BarChart3 className="choice-icon" size={18} /><strong>Mutual Fund</strong><span>10.5% assumption</span></button>
                </div>
                <div className="form-section"><label className="option-label" htmlFor="investment-amount">Amount to imagine <small>minimum ₹100</small></label><input id="investment-amount" className="field" inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setNotice(''); }} data-testid="input-investment-amount" /></div>
                <div className="form-section"><span className="option-label">Time horizon</span><div className="horizon-grid">{([1, 3, 5] as const).map((years) => <button type="button" className={`horizon ${horizon === years ? 'selected' : ''}`} onClick={() => setHorizon(years)} key={years} data-testid={`choice-horizon-${years}`}>{years} {years === 1 ? 'year' : 'years'}</button>)}</div></div>
                {type && numericAmount >= 100 && <div className="projection-line"><span>Illustrative value in {horizon}y</span><strong data-testid="text-projected-value">{formatINR(projected, 2)}</strong></div>}
                <button type="button" className="button-primary" style={{ marginTop: 18 }} onClick={saveProjection} disabled={!type || numericAmount < 100} data-testid="button-save-projection">Save projection <Check size={14} /></button>
                {notice && <div className="redeemed-note" data-testid="status-projection-saved">{notice}</div>}
              </>
            ) : (
              <div className="empty-state" style={{ minHeight: 210, padding: '30px 0' }}><div><div className="empty-mark"><Target size={17} /></div><div>Reach ₹100 to choose a simulated destination.</div><Link href="/dashboard" className="small-link" data-testid="link-investment-back-dashboard">Back to overview</Link></div></div>
            )}
          </article>
        </section>
        {unlocked && data.investmentType && (
          <section className="card card-pad" style={{ marginTop: 17, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div><div className="eyebrow">Simulation saved locally</div><h2 style={{ font: '400 2rem var(--app-font-serif)', margin: '9px 0 5px' }}>{PROJECTION_ASSUMPTIONS[data.investmentType].label} · {formatINR(data.investmentAmount, 2)}</h2><p className="subtle-note">At {data.simulatedReturnRate * 100}% illustrative rate over {data.timeHorizon} {data.timeHorizon === 1 ? 'year' : 'years'} → {formatINR(data.projectedValue, 2)}</p></div>
            <button type="button" className="button-quiet" onClick={() => setShowRedeem(true)} data-testid="button-simulated-redemption"><RotateCcw size={14} /> Simulate redemption</button>
          </section>
        )}
        <p className="disclaimer">Simulation only. Projected returns are illustrative and are not guaranteed. This application does not provide financial advice.</p>
        {showRedeem && <RedemptionModal onClose={() => setShowRedeem(false)} onConfirm={() => { saveData((previous) => ({ ...previous, redeemed: true })); setShowRedeem(false); setNotice('Redemption simulated locally. No money moved.'); }} />}
      </div>
    </AppShell>
  );
}

function RedemptionModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="redemption-title">
        <div className="modal-head"><div><div className="eyebrow">A clear boundary</div><h2 id="redemption-title">Simulate a redemption?</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close redemption dialog" data-testid="button-close-redemption"><X size={17} /></button></div>
        <p>This only marks the simulated journey as redeemed on this device. No bank account, payment, or real investment is connected.</p>
        <div className="modal-actions"><button type="button" className="button-quiet" onClick={onClose} data-testid="button-cancel-redemption">Keep exploring</button><button type="button" className="button-primary" onClick={onConfirm} data-testid="button-confirm-redemption">Confirm simulation <Check size={14} /></button></div>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return <main className="landing" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 30 }}><div style={{ textAlign: 'center' }}><div className="eyebrow">404 / quiet corner</div><h1 className="page-title">Nothing gathered here.</h1><Link href="/dashboard" className="button-primary" data-testid="link-not-found-dashboard">Return to your nest <ArrowRight size={14} /></Link></div></main>;
}

function Router() {
  const { data, saveData, lastSaved } = useSavingsData();
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/setup"><SetupPage data={data} saveData={saveData} /></Route>
      <Route path="/dashboard"><DashboardPage data={data} saveData={saveData} lastSaved={lastSaved} /></Route>
      <Route path="/transactions"><TransactionsPage data={data} saveData={saveData} lastSaved={lastSaved} /></Route>
      <Route path="/investment"><InvestmentPage data={data} saveData={saveData} lastSaved={lastSaved} /></Route>
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>;
}

export default App;