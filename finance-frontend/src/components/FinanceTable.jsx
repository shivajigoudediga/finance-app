import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Table, Badge, ActionIcon, Group, Select,
  Text, Paper, SimpleGrid, Stack, Loader
} from '@mantine/core'
import { IconEdit, IconTrash, IconTrendingUp, IconTrendingDown, IconWallet } from '@tabler/icons-react'
import { getAll, remove, getRates } from '../api/financeApi'
import { modals } from '@mantine/modals'

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

const columns = [
  { key: 'userName',    label: 'User' },
  { key: 'type',        label: 'Type' },
  { key: 'category',    label: 'Category' },
  { key: 'amount',      label: 'Amount' },
  { key: 'description', label: 'Description' },
  { key: 'date',        label: 'Date' },
  { key: 'actions',     label: '' },
]

function fmt(val, code) {
  const digits = code === 'JPY' ? 0 : 2
  return val.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

// ── Currency Popover ─────────────────────────────────────────────
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
  const style = {
    position: 'fixed',
    top: (rect?.bottom ?? 0) + 6,
    left: Math.min(rect?.left ?? 0, window.innerWidth - 290),
    zIndex: 9999,
    background: '#fff',
    border: '1.5px solid #e0e0ee',
    borderRadius: 14,
    boxShadow: '0 8px 32px rgba(80,70,180,0.15)',
    width: 282,
    padding: '10px 6px 6px',
    fontFamily: 'system-ui, sans-serif',
  }

  return (
    <div ref={popRef} style={style}>
      <div style={{ padding: '0 8px 8px', borderBottom: '1px solid #f0f0f8', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR converts to
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 0' }}>
          <Loader size="sm" color="violet" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {Object.entries(CURRENCIES).map(([code, info]) => {
            const converted = rates?.[code] ? amount * rates[code] : null
            const isActive  = activeCurrency === code
            return (
              <button
                key={code}
                onClick={() => onSelect(code, converted)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px',
                  border: isActive ? '1.5px solid #6c63ff' : '1.5px solid transparent',
                  borderRadius: 10,
                  background: isActive ? '#f3f0ff' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8f7ff' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 19, lineHeight: 1 }}>{info.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e', letterSpacing: '0.03em' }}>{code}</div>
                  <div style={{ fontSize: 12, color: '#333', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {converted !== null ? `${info.symbol}${fmt(converted, code)}` : '—'}
                  </div>
                </div>
                {isActive && <span style={{ fontSize: 13, color: '#6c63ff' }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ padding: '8px 6px 2px', marginTop: 4, borderTop: '1px solid #f0f0f8' }}>
        <button
          onClick={() => onSelect('INR', amount)}
          style={{
            width: '100%', padding: '7px', border: 'none',
            borderRadius: 8, background: '#f0f0f8', cursor: 'pointer',
            fontSize: 12, color: '#6c63ff', fontWeight: 600, letterSpacing: '0.02em',
          }}
        >
          ↩ Reset to ₹ INR
        </button>
      </div>
    </div>
  )
}

// ── Amount Cell ──────────────────────────────────────────────────
function AmountCell({ amount, type, activeCurrency, displayAmount, onOpen }) {
  const ref   = useRef(null)
  const isINR = !activeCurrency || activeCurrency === 'INR'
  const info  = CURRENCIES[activeCurrency]
  const sign  = type === 'INCOME' ? '+' : '-'
  const green = type === 'INCOME'

  return (
    <span
      ref={ref}
      onClick={() => onOpen(ref)}
      title="Click to convert currency"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        cursor: 'pointer', padding: '3px 9px', borderRadius: 8,
        border: '1.5px dashed',
        borderColor: green ? '#22c55e66' : '#ef444466',
        background: green ? '#f0fdf4' : '#fff5f5',
        transition: 'border-style 0.12s', userSelect: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderStyle = 'solid' }}
      onMouseLeave={e => { e.currentTarget.style.borderStyle = 'dashed' }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: green ? '#16a34a' : '#dc2626' }}>
        {isINR
          ? `${sign}₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : `${sign}${info?.symbol ?? ''}${fmt(displayAmount, activeCurrency)}`
        }
      </span>
      {!isINR && (
        <span style={{ fontSize: 10, fontWeight: 700, color: '#888', marginLeft: 1 }}>{activeCurrency}</span>
      )}
      <span style={{ fontSize: 13 }}>{isINR ? '₹' : (info?.flag ?? '')}</span>
    </span>
  )
}

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon }) {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.06em' }}>{label}</Text>
        <Icon size={16} color={`var(--mantine-color-${color}-6)`} />
      </Group>
      <Text size="xl" fw={700} c={color}>
        ₹{parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </Text>
    </Paper>
  )
}

// ── Main Table ───────────────────────────────────────────────────
export default function FinanceTable({ onEdit, onDelete }) {
  const [rows, setRows]           = useState([])
  const [sort, setSort]           = useState(null)
  const [popover, setPopover]     = useState(null)   // { rowId, anchorRef }
  const [currencies, setCurrencies] = useState({})   // { [rowId]: { currency, converted } }

  useEffect(() => { getAll(sort).then(setRows) }, [sort])

  const totalIncome  = rows.filter(r => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0)
  const totalExpense = rows.filter(r => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0)
  const balance      = totalIncome - totalExpense

  const handleDelete = (id) =>
    modals.openConfirmModal({
      title: 'Delete record?',
      children: <Text size="sm" c="dimmed">This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red', radius: 'md' },
      cancelProps: { radius: 'md', variant: 'default' },
      onConfirm: () => remove(id).then(onDelete),
    })

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
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <StatCard label="Total Income"  value={totalIncome}  color="green"  icon={IconTrendingUp} />
        <StatCard label="Total Expense" value={totalExpense} color="red"    icon={IconTrendingDown} />
        <StatCard label="Balance"       value={balance}      color={balance >= 0 ? 'violet' : 'red'} icon={IconWallet} />
      </SimpleGrid>

      <Group>
        <Select
          placeholder="Sort by…"
          data={[
            { value: 'userName',    label: 'User Name (A–Z)' },
            { value: 'amount,desc', label: 'Amount (High → Low)' },
            { value: 'date,desc',   label: 'Date (Newest First)' },
          ]}
          value={sort} onChange={setSort} clearable
          style={{ width: 220 }} radius="md" size="sm"
        />
        <Text size="sm" c="dimmed" ml="auto">
          {rows.length} record{rows.length !== 1 ? 's' : ''}
        </Text>
      </Group>

      {rows.length === 0 ? (
        <Paper p="xl" radius="md" withBorder ta="center">
          <Text c="dimmed" size="sm">No records yet. Add your first record!</Text>
        </Paper>
      ) : (
        <div style={{ position: 'relative' }}>
          <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
            <Table.Thead>
              <Table.Tr>
                {columns.map(c => (
                  <Table.Th key={c.key} style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>
                    {c.label}
                    {c.key === 'amount' && (
                      <span style={{ fontSize: 10, fontWeight: 400, color: '#bbb', marginLeft: 5, textTransform: 'none', letterSpacing: 0 }}>
                        (click to convert)
                      </span>
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map(r => {
                const override = currencies[r.id]
                return (
                  <Table.Tr key={r.id}>
                    <Table.Td><Text size="sm" fw={500}>{r.userName}</Text></Table.Td>
                    <Table.Td>
                      <Badge color={r.type === 'INCOME' ? 'green' : 'red'} variant="light" radius="sm" size="sm">
                        {r.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{r.category}</Text></Table.Td>
                    <Table.Td>
                      <AmountCell
                        amount={r.amount}
                        type={r.type}
                        activeCurrency={override?.currency ?? 'INR'}
                        displayAmount={override?.converted ?? r.amount}
                        onOpen={(ref) => openPopover(r.id, ref)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" lineClamp={1} style={{ maxWidth: 180 }}>
                        {r.description || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td><Text size="sm">{r.date}</Text></Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon variant="subtle" color="violet" radius="md" onClick={() => onEdit(r)}>
                          <IconEdit size={15} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" radius="md" onClick={() => handleDelete(r.id)}>
                          <IconTrash size={15} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>

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
    </Stack>
  )
}