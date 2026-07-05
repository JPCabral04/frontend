import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Chip, Skeleton, TextField, InputAdornment } from '@mui/material';
import {
  AddOutlined, DeleteOutlined, EditOutlined, SearchOutlined,
  SwapHorizOutlined, TrendingUpOutlined, TrendingDownOutlined,
} from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { transactionService } from '../services/transactionService';
import { TransactionForm } from '../components/TransactionForm';
import { SideDrawer } from '../../../components/feedback/SideDrawer';
import { CategoryTag, EmptyState } from '../../../components/data-display/Badges';
import { SummaryCard } from '../../../components/data-display/SummaryCard';
import type { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '../../../types/entities';
import { formatCurrency, formatDate } from '../../../utils/formatters';

type FilterType = 'all' | 'INCOME' | 'EXPENSE';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try { setTransactions(await transactionService.getAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = transactions
    .filter(t => {
      const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || t.transactionType === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const totalIncome = transactions.filter(t => t.transactionType === 'INCOME').reduce((s, t) => s + (t.financialItem?.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.transactionType === 'EXPENSE').reduce((s, t) => s + (t.financialItem?.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  const handleSave = async (data: CreateTransactionDTO | UpdateTransactionDTO) => {
    if (editing) {
      await transactionService.update(editing.financialItemId, data);
    } else {
      await transactionService.create(data as CreateTransactionDTO);
    }
    setDrawerOpen(false);
    setEditing(null);
    await fetchAll();
  };

  const handleDelete = async (t: Transaction) => {
    if (!confirm(`Excluir "${t.description ?? 'transação'}"?`)) return;
    setTransactions(prev => prev.filter(x => x.financialItemId !== t.financialItemId));
    await transactionService.remove(t.financialItemId);
  };

  const openEdit = (t: Transaction) => { setEditing(t); setDrawerOpen(true); };
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  // Group by month
  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach(t => {
    const key = format(parseISO(t.date), 'MMMM yyyy', { locale: ptBR });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Transações</Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
            {transactions.length} registros
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}
          sx={{ borderRadius: '10px', background: 'hsl(245, 85%, 65%)', fontWeight: 600, boxShadow: '0 4px 12px hsl(245, 85%, 65%, 0.3)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          Nova Transação
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <SummaryCard
          icon={<TrendingUpOutlined sx={{ fontSize: 20, color: 'var(--color-success)' }} />}
          label="Total de entradas"
          value={formatCurrency(totalIncome)}
          iconBg="var(--color-success-subtle)"
        />
        <SummaryCard
          icon={<TrendingDownOutlined sx={{ fontSize: 20, color: 'var(--color-danger)' }} />}
          label="Total de saídas"
          value={formatCurrency(totalExpense)}
          iconBg="var(--color-danger-subtle)"
        />
        <SummaryCard
          icon={<SwapHorizOutlined sx={{ fontSize: 20, color: 'var(--color-accent)' }} />}
          label="Saldo"
          value={formatCurrency(balance)}
          iconBg="var(--color-accent-subtle)"
          trend={balance >= 0 ? { value: 'positivo', positive: true } : { value: 'negativo', positive: false }}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar transações..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 18, color: 'var(--color-text-tertiary)' }} /></InputAdornment> } }}
          sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '8px', background: 'var(--color-surface)' } }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['all', 'INCOME', 'EXPENSE'] as FilterType[]).map(f => (
            <Chip key={f} label={{ all: 'Todas', INCOME: '⬆️ Receitas', EXPENSE: '⬇️ Despesas' }[f]}
              onClick={() => setFilter(f)}
              size="small"
              sx={{
                borderRadius: '8px', fontWeight: filter === f ? 600 : 400, cursor: 'pointer',
                background: filter === f ? 'hsl(245, 85%, 65%)' : 'var(--color-surface)',
                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
                borderColor: filter === f ? 'transparent' : 'var(--color-border)',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* List */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: '8px', bgcolor: 'var(--color-bg-tertiary)' }} />)}
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ p: 4, borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <EmptyState
            icon={<SwapHorizOutlined sx={{ fontSize: 40 }} />}
            title="Nenhuma transação encontrada"
            description="Registre sua primeira transação."
            action={<Button variant="contained" size="small" startIcon={<AddOutlined />} onClick={openCreate} sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)' }}>Nova Transação</Button>}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(grouped).map(([month, txs]) => (
            <Box key={month}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {month}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  {txs.filter(t => t.transactionType === 'INCOME').reduce((s, t) => s + (t.financialItem?.amount || 0), 0) -
                    txs.filter(t => t.transactionType === 'EXPENSE').reduce((s, t) => s + (t.financialItem?.amount || 0), 0) >= 0 ? '+' : ''}
                  {formatCurrency(txs.filter(t => t.transactionType === 'INCOME').reduce((s, t) => s + (t.financialItem?.amount || 0), 0) -
                    txs.filter(t => t.transactionType === 'EXPENSE').reduce((s, t) => s + (t.financialItem?.amount || 0), 0))}
                </Typography>
              </Box>
              <Box sx={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                {txs.map((tx, idx) => (
                  <Box key={tx.financialItemId}>
                    {idx > 0 && <Box sx={{ height: 1, background: 'var(--color-border)', mx: 2 }} />}
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5,
                      transition: 'background 150ms', '&:hover': { background: 'var(--color-surface-hover)' },
                      '&:hover .tx-actions': { opacity: 1 },
                    }}>
                      {/* Type icon */}
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: tx.transactionType === 'INCOME' ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
                      }}>
                        {tx.transactionType === 'INCOME'
                          ? <TrendingUpOutlined sx={{ fontSize: 18, color: 'var(--color-success)' }} />
                          : <TrendingDownOutlined sx={{ fontSize: 18, color: 'var(--color-danger)' }} />}
                      </Box>

                      {/* Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description ?? (tx.transactionType === 'INCOME' ? 'Receita' : 'Despesa')}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                          {formatDate(tx.date, 'dd/MM/yyyy')}
                        </Typography>
                      </Box>

                      <CategoryTag category={tx.category} size="sm" />

                      {/* Amount */}
                      <Typography sx={{
                        fontSize: '14px', fontWeight: 700, flexShrink: 0,
                        color: tx.transactionType === 'INCOME' ? 'var(--color-success)' : 'var(--color-danger)',
                      }}>
                        {tx.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(tx.financialItem?.amount || 0)}
                      </Typography>

                      {/* Actions */}
                      <Box className="tx-actions" sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 150ms' }}>
                        <IconButton size="small" onClick={() => openEdit(tx)} sx={{ borderRadius: '6px', color: 'var(--color-text-secondary)' }}>
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(tx)} sx={{ borderRadius: '6px', color: 'var(--color-danger)' }}>
                          <DeleteOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <SideDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} title={editing ? 'Editar Transação' : 'Nova Transação'}>
        <TransactionForm transaction={editing ?? undefined} onSave={handleSave} onCancel={() => { setDrawerOpen(false); setEditing(null); }} />
      </SideDrawer>
    </Box>
  );
}
