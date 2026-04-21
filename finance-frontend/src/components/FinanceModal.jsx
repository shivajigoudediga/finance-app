import { Modal, TextInput, Select, NumberInput,
         Textarea, Button, Stack, Group, Text } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useState, useEffect } from 'react'
import { create, update } from '../api/financeApi'

export default function FinanceModal({ opened, onClose, record, onSaved }) {
  const empty = {
    userName: '', type: 'EXPENSE', category: '',
    amount: '', description: '', date: new Date()
  }
  const [form, setForm]       = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setForm(record ? { ...record, date: new Date(record.date) } : empty)
    setError(null)
  }, [record, opened])

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.userName || !form.category || !form.amount) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = { ...form, date: form.date.toISOString().split('T')[0] }
      record ? await update(record.id, payload) : await create(payload)
      onSaved()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg" c="violet.7">
          {record ? '✏️ Edit Record' : '➕ New Record'}
        </Text>
      }
      radius="lg"
      padding="xl"
      size="md"
    >
      <Stack gap="sm">
        {error && (
          <Text size="sm" c="red" bg="red.0" p="sm" style={{ borderRadius: 8 }}>
            {error}
          </Text>
        )}
        <TextInput
          label="User Name" required
          value={form.userName}
          onChange={e => set('userName')(e.target.value)}
          placeholder="e.g. Rahul"
          radius="md"
        />
        <Select
          label="Type" required
          data={[
            { value: 'INCOME',  label: '🟢 Income' },
            { value: 'EXPENSE', label: '🔴 Expense' },
          ]}
          value={form.type}
          onChange={set('type')}
          radius="md"
        />
        <TextInput
          label="Category" required
          value={form.category}
          onChange={e => set('category')(e.target.value)}
          placeholder="e.g. Salary, Food, Rent"
          radius="md"
        />
        <NumberInput
          label="Amount (₹)" required
          value={form.amount}
          onChange={set('amount')}
          min={0}
          prefix="₹"
          thousandSeparator=","
          placeholder="0.00"
          radius="md"
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={e => set('description')(e.target.value)}
          placeholder="Optional notes…"
          radius="md"
          autosize minRows={2}
        />
        <DateInput
          label="Date" required
          value={form.date}
          onChange={set('date')}
          radius="md"
          valueFormat="DD MMM YYYY"
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose} radius="md">Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            color="violet"
            radius="md"
          >
            {record ? 'Update Record' : 'Save Record'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}