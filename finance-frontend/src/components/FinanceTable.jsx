import { useEffect, useState, useRef, useCallback } from 'react'
import { Select, Loader } from '@mantine/core'
import { IconEdit, IconTrash, IconTrendingUp, IconTrendingDown, IconWallet } from '@tabler/icons-react'
import { getAll, remove, getRates } from '../api/financeApi'

const CURRENCIES = {
  USD: { name: 'US Dollar',         symbol: '$',   flag: '🇺🇸' },
  EUR: { name: 'Euro',              symbol: '€',   flag: '🇪🇺' },
  GBP: { name: 'British Pound',     symbol: '£',   flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen',      symbol: '¥',   flag: '🇯🇵' },
  AED: { name: 'UAE Dirham',        symbol: 'د.إ', flag: '🇦🇪' },
  SGD: { name: 'Singapore Dollar',  symbol: 'S$',  flag: '🇸🇬' },
  CAD: { name: 'Canadian Dollar',   symbol: 'C$',  flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', symbol: 'A$',  flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc',       symbol: 'Fr',  flag: '🇨🇭' },
}

function fmt(val, code) {
  const digits = code === 'JPY' ? 0 : 2
  return val.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function CurrencyPopover({ amount, anchorRef, onSelect, onClose, activeCurrency }) {
  const [rates, setRates] = useState(null)
  const [loading, setLoad] = useState(true)
  const popRef = useRef(null)

  useEffect(() => {
    setLoad(true)
    getRates('INR')
      .then(r => {
        const out = {}
        Object.keys(CURRENCIES).forEach(c => { if (r[c]) out[c] = r[c] })
        setRates(out)
      })
      .finally(() => setLoad(false))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorRef])

  const rect = anchorRef.current?.getBoundingClientRect()
  const top  = (rect?.bottom ?? 0) + 6
  const left = Math.min(rect?.left ?? 0, window.innerWidth - 300)

  return (
    <div ref={popRef} className="currency-popover" style={{ top, left }}>
      <div className="currency-popover-header">
        ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR converts to
      </div>
      {loading ? (
        <div className="loader-wrap" style={{ padding: '20px 0' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="currency-grid">
          {Object.entries(CURRENCIES).map(([code, info]) => {
            const converted = rates?.[code] ? amount * rates[code] : null
            const isActive  = activeCurrency === code
            return (
              <button
                key={code}
                className={`currency-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelect(code, converted)}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{info.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="currency-code">{code}</div>
                  <div className="currency-val">
                    {converted !== null ? `${info.symbol}${fmt(converted, code)}` : '—'}
                  </div>
                </div>
                {isActive && <span style={{ fontSize: 12, color: 'var(--accent2)' }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}
      <div className="currency-reset">
        <button className="currency-reset-btn" onClick={() => onSelect('INR', amount)}>
          ↩ Reset to ₹ INR
        </button>
      </div>
    </div>
  )
}

function AmountCell({ amount, type, activeCurrency, displayAmount, onOpen }) {
  const ref   = useRef(null)
  const isINR = !activeCurrency || activeCurrency === 'INR'
  const info  = CURRENCIES[activeCurrency]
  const sign  = type === 'INCOME' ? '+' : '-'
  const cls   = type === 'INCOME' ? 'income' : 'expense'

  return (
    <span
      ref={ref}
      className={`amount-cell ${cls}`}
      onClick={() => onOpen(ref)}
      title="Click to convert currency"
    >
      <span>
        {isINR
          ? `${sign}₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : `${sign}${info?.symbol ?? ''}${fmt(displayAmount, activeCurrency)}`
        }
      </span>
      {!isINR && <span style={{ fontSize: 10, opacity: 0.7 }}>{activeCurrency}</span>}
      <span style={{ fontSize: 12 }}>{isINR ? '₹' : (info?.flag ?? '')}</span>
    </span>
  )
}

function StatCard({ label, value, colorClass, icon: Icon, glow }) {
  return (
    <div className="stat-card">
      <div className="stat-card-glow" style={{ background: glow }} />
      <div className="stat-label">
        <Icon size={13} />
        {label}
      </div>
      <div className={`stat-value ${colorClass}`}>
        ₹{parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>
    </div>
  )
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-title">🗑 Delete Record?</div>
        <div className="confirm-text">This action cannot be undone.</div>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function FinanceTable({ onEdit, onDelete }) {
  const [rows, setRows]         = useState([])
  const [sort, setSort]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [popover, setPopover]   = useState(null)
  const [currencies, setCurrencies] = useState({})
  const [confirm, setConfirm]   = useState(null)

  useEffect(() => {
    setLoading(true)
    getAll(sort).then(setRows).finally(() => setLoading(false))
  }, [sort])

  const totalIncome  = rows.filter(r => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0)
  const totalExpense = rows.filter(r => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0)
  const balance      = totalIncome - totalExpense

  const handleDelete = (id) => setConfirm(id)

  const openPopover = useCallback((rowId, anchorRef) => {
    setPopover(prev => prev?.rowId === rowId ? null : { rowId, anchorRef })
  }, [])

  const handleSelect = useCallback((code, converted) => {
    if (!popover) return
    setCurrencies(prev => ({
      ...prev,
      [popover.rowId]: code === 'INR' ? null : { currency: code, converted }
    }))
    setPopover(null)
  }, [popover])

  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Total Income"  value={totalIncome}  colorClass="green"  icon={IconTrendingUp}   glow="rgba(52,211,153,0.4)" />
        <StatCard label="Total Expense" value={totalExpense} colorClass="red"    icon={IconTrendingDown} glow="rgba(251,113,133,0.4)" />
        <StatCard label="Balance"       value={balance}      colorClass={balance >= 0 ? 'violet' : 'red'} icon={IconWallet} glow="rgba(124,107,255,0.4)" />
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <select
            className="sort-select"
            value={sort ?? ''}
            onChange={e => setSort(e.target.value || null)}
          >
            <option value="">Sort by…</option>
            <option value="userName">User Name (A–Z)</option>
            <option value="amount,desc">Amount (High → Low)</option>
            <option value="date,desc">Date (Newest First)</option>
          </select>
          <div className="record-count">{rows.length} record{rows.length !== 1 ? 's' : ''}</div>
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner" /></div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-text">No records yet. Add your first record!</div>
          </div>
        ) : (
          <div style={{ position: 'relative', overflowX: 'auto' }}>
            <table className="finance-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount <span style={{ fontWeight: 400, opacity: 0.5, fontSize: 10, textTransform: 'none' }}>(click to convert)</span></th>
                  <th>Description</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const override = currencies[r.id]
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">{r.userName?.[0]?.toUpperCase()}</div>
                          <span className="user-name">{r.userName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${r.type === 'INCOME' ? 'income' : 'expense'}`}>
                          {r.type === 'INCOME' ? '↑' : '↓'} {r.type}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.category}</td>
                      <td>
                        <AmountCell
                          amount={r.amount}
                          type={r.type}
                          activeCurrency={override?.currency ?? 'INR'}
                          displayAmount={override?.converted ?? r.amount}
                          onOpen={(ref) => openPopover(r.id, ref)}
                        />
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 180 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.description || '—'}
                        </span>
                      </td>
                      <td><span className="date-chip">{r.date}</span></td>
                      <td>
                        <button className="action-btn edit" onClick={() => onEdit(r)} title="Edit">
                          <IconEdit size={14} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(r.id)} title="Delete">
                          <IconTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {popover && (
              <CurrencyPopover
                amount={rows.find(r => r.id === popover.rowId)?.amount ?? 0}
                anchorRef={popover.anchorRef}
                activeCurrency={currencies[popover.rowId]?.currency ?? 'INR'}
                onSelect={handleSelect}
                onClose={() => setPopover(null)}
              />
            )}
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          onConfirm={() => { remove(confirm).then(onDelete); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}