import { useState } from 'react'
import FinanceTable from './components/FinanceTable'
import FinanceModal from './components/FinanceModal'
import CurrencyConverter from './components/CurrencyConverter'
import { Button, Title, Group, Tabs, Paper, Container } from '@mantine/core'
import { IconCurrencyRupee, IconTable, IconCurrencyDollar } from '@tabler/icons-react'

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [refresh, setRefresh] = useState(0)

  const openAdd  = () => { setEditRecord(null); setModalOpen(true) }
  const openEdit = (r) => { setEditRecord(r);   setModalOpen(true) }
  const onSaved  = () => { setModalOpen(false); setRefresh(r => r + 1) }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Group gap="sm">
          <IconCurrencyRupee size={32} color="#6c63ff" />
          <Title order={1} style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>
            Finance Manager
          </Title>
        </Group>
      </Group>

      <Tabs defaultValue="records" color="violet">
        <Tabs.List mb="lg">
          <Tabs.Tab value="records" leftSection={<IconTable size={15} />}>
            Finance Records
          </Tabs.Tab>
          <Tabs.Tab value="converter" leftSection={<IconCurrencyDollar size={15} />}>
            Currency Converter
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="records">
          <Paper p="md" radius="lg" withBorder>
            <Group justify="flex-end" mb="md">
              <Button
                onClick={openAdd}
                color="violet"
                radius="md"
                leftSection={<span style={{ fontSize: 16, lineHeight: 1 }}>+</span>}
              >
                Add Record
              </Button>
            </Group>
            <FinanceTable
              key={refresh}
              onEdit={openEdit}
              onDelete={() => setRefresh(r => r + 1)}
            />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="converter">
          <Paper p="xl" radius="lg" withBorder style={{ maxWidth: 560 }}>
            <CurrencyConverter />
          </Paper>
        </Tabs.Panel>
      </Tabs>

      <FinanceModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        record={editRecord}
        onSaved={onSaved}
      />
    </Container>
  )
}