import { useState, useEffect } from 'react'
import { create, update } from '../api/financeApi'

export default function FinanceModal({ opened, onClose, record, onSaved }) {
  const empty = {
    userName: '', type: 'EXPENSE', category: '',
    amount: '', description: '', date: new Date().toISOString().split('T')[0]
  }
  const [form, setForm]       = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (record) {
      setForm({ ...record, date: record.date })
    } else {
      setForm(empty)
    }
    setError(null)
  }, [record, opened])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target ? e.target.value : e }))

  const handleSubmit = async () => {
    if (!form.userName || !form.category || !form.amount) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        date: typeof form.date === 'string' ? form.date : form.date.toISOString().split('T')[0]
      }
      record ? await update(record.id, payload) : await create(payload)
      onSaved()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!opened) return null

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">
          {record ? '✏️ Edit Record' : '✨ New Record'}
        </div>

        <div className="form-stack">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div>
              <label className="field-label">User Name <span>*</span></label>
              <input
                className="field-input"
                value={form.userName}
                onChange={set('userName')}
                placeholder="e.g. Rahul"
              />
            </div>
            <div>
              <label className="field-label">Type <span>*</span></label>
              <select className="field-select" value={form.type} onChange={set('type')}>
                <option value="INCOME">🟢 Income</option>
                <option value="EXPENSE">🔴 Expense</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div>
              <label className="field-label">Category <span>*</span></label>
              <input
                className="field-input"
                value={form.category}
                onChange={set('category')}
                placeholder="e.g. Salary, Food, Rent"
              />
            </div>
            <div>
              <label className="field-label">Amount (₹) <span>*</span></label>
              <div className="field-prefix-wrap">
                <span className="field-prefix">₹</span>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={set('amount')}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="field-label">Date <span>*</span></label>
            <input
              className="field-input"
              type="date"
              value={form.date}
              onChange={set('date')}
            />
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea
              className="field-textarea"
              value={form.description}
              onChange={set('description')}
              placeholder="Optional notes…"
              rows={2}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : record ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  )
}