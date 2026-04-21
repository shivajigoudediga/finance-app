import { useState } from 'react'
import FinanceTable from './components/FinanceTable'
import FinanceModal from './components/FinanceModal'
import CurrencyConverter from './components/CurrencyConverter'
import { IconTable, IconCurrencyDollar } from '@tabler/icons-react'
import './App.css'

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [tab, setTab] = useState('records')

  const openAdd  = () => { setEditRecord(null); setModalOpen(true) }
  const openEdit = (r) => { setEditRecord(r);   setModalOpen(true) }
  const onSaved  = () => { setModalOpen(false); setRefresh(r => r + 1) }

  return (
    <div className="app-root">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div className="app-shell">
        <header className="app-header">
          <div className="header-left">
            <div className="logo-mark">₹</div>
            <div>
              <h1 className="app-title">Finance Manager</h1>
              <p className="app-subtitle">Track · Analyze · Grow</p>
            </div>
          </div>
          <button className="add-btn" onClick={openAdd}>
            <span className="add-btn-icon">+</span>
            <span>Add Record</span>
          </button>
        </header>

        <div className="tabs-list">
          <button className={`tab-btn ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>
            <IconTable size={14} /> Finance Records
          </button>
          <button className={`tab-btn ${tab === 'converter' ? 'active' : ''}`} onClick={() => setTab('converter')}>
            <IconCurrencyDollar size={14} /> Currency Converter
          </button>
        </div>

        {tab === 'records' && (
          <FinanceTable key={refresh} onEdit={openEdit} onDelete={() => setRefresh(r => r + 1)} />
        )}
        {tab === 'converter' && (
          <div className="converter-card">
            <h2 className="converter-title">💱 Currency Converter</h2>
            <CurrencyConverter />
          </div>
        )}
      </div>

      <FinanceModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        record={editRecord}
        onSaved={onSaved}
      />
    </div>
  )
}