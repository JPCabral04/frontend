import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Skeleton } from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined, ShowChartOutlined, TrendingUpOutlined } from '@mui/icons-material';
import { investmentService } from '../services/investmentService';
import { InvestmentForm } from '../components/InvestmentForm';
import { SideDrawer } from '../../../components/feedback/SideDrawer';
import { EmptyState } from '../../../components/data-display/Badges';
import { SummaryCard } from '../../../components/data-display/SummaryCard';
import type { Investment, CreateInvestmentDTO, UpdateInvestmentDTO } from '../../../types/entities';
import { formatCurrency, formatPercent } from '../../../utils/formatters';

// Palette for chart segments
const COLORS = [
  'hsl(245, 85%, 65%)', 'hsl(152, 60%, 40%)', 'hsl(38, 95%, 50%)',
  'hsl(0, 75%, 55%)', 'hsl(210, 80%, 52%)', 'hsl(280, 70%, 60%)',
];

export function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try { setInvestments(await investmentService.getAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (data: CreateInvestmentDTO | UpdateInvestmentDTO) => {
    if (editing) {
      await investmentService.update(editing.financialItemId, data);
    } else {
      await investmentService.create(data as CreateInvestmentDTO);
    }
    setDrawerOpen(false);
    setEditing(null);
    await fetchAll();
  };

  const handleDelete = async (inv: Investment) => {
    if (!confirm(`Excluir "${inv.assetName}"?`)) return;
    setInvestments(prev => prev.filter(i => i.financialItemId !== inv.financialItemId));
    await investmentService.remove(inv.financialItemId);
  };

  const openEdit = (inv: Investment) => { setEditing(inv); setDrawerOpen(true); };
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  const totalAmount = investments.reduce((s, i) => s + (i.financialItem?.amount || 0), 0);
  const avgReturn = investments.length > 0
    ? investments.filter(i => i.estimatedReturn).reduce((s, i) => s + (i.estimatedReturn ?? 0), 0) / investments.filter(i => i.estimatedReturn).length
    : 0;

  // Build allocation segments (CSS-only donut via conic-gradient)
  const segments = investments.map((inv, idx) => ({
    label: inv.assetName,
    value: inv.financialItem?.amount || 0,
    pct: totalAmount > 0 ? ((inv.financialItem?.amount || 0) / totalAmount) * 100 : 0,
    color: COLORS[idx % COLORS.length],
  }));

  const conicGradient = totalAmount > 0
    ? (() => {
        let acc = 0;
        return segments.map(s => {
          const start = acc;
          acc += s.pct;
          return `${s.color} ${start.toFixed(1)}% ${acc.toFixed(1)}%`;
        }).join(', ');
      })()
    : 'var(--color-bg-tertiary) 0% 100%';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Investimentos</Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
            {investments.length} ativos na carteira
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}
          sx={{ borderRadius: '10px', background: 'hsl(245, 85%, 65%)', fontWeight: 600, boxShadow: '0 4px 12px hsl(245, 85%, 65%, 0.3)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          Novo Investimento
        </Button>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <SummaryCard
          icon={<ShowChartOutlined sx={{ fontSize: 20, color: 'var(--color-accent)' }} />}
          label="Total investido"
          value={formatCurrency(totalAmount)}
          iconBg="var(--color-accent-subtle)"
        />
        <SummaryCard
          icon={<TrendingUpOutlined sx={{ fontSize: 20, color: 'var(--color-success)' }} />}
          label="Retorno médio est."
          value={investments.some(i => i.estimatedReturn) ? `${avgReturn.toFixed(1)}% a.a.` : '—'}
          iconBg="var(--color-success-subtle)"
        />
        <SummaryCard
          icon={<ShowChartOutlined sx={{ fontSize: 20, color: 'var(--color-warning)' }} />}
          label="Ativos"
          value={String(investments.length)}
          iconBg="var(--color-warning-subtle)"
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: '12px', bgcolor: 'var(--color-bg-tertiary)' }} />
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: '12px', bgcolor: 'var(--color-bg-tertiary)' }} />
        </Box>
      ) : investments.length === 0 ? (
        <Box sx={{ p: 4, borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <EmptyState
            icon={<ShowChartOutlined sx={{ fontSize: 40 }} />}
            title="Nenhum investimento registrado"
            description="Adicione seus ativos para acompanhar sua carteira."
            action={<Button variant="contained" size="small" startIcon={<AddOutlined />} onClick={openCreate} sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)' }}>Novo Investimento</Button>}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {/* Allocation chart */}
          <Box sx={{ p: 3, borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', mb: 2.5 }}>
              Alocação da Carteira
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* CSS Donut */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Box sx={{
                  width: 120, height: 120,
                  borderRadius: '50%',
                  background: `conic-gradient(${conicGradient})`,
                  boxShadow: 'var(--shadow-md)',
                }} />
                {/* Hole */}
                <Box sx={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'var(--color-surface)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                    {investments.length}
                  </Typography>
                  <Typography sx={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>ativos</Typography>
                </Box>
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                {segments.map(seg => (
                  <Box key={seg.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '3px', background: seg.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {seg.label}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', flexShrink: 0 }}>
                      {seg.pct.toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Table */}
          <Box sx={{ p: 3, borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', mb: 2.5 }}>
              Seus Ativos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {investments.map((inv, idx) => (
                <Box key={inv.financialItemId} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: '8px',
                  transition: 'background 150ms', '&:hover': { background: 'var(--color-surface-hover)' },
                  '&:hover .inv-actions': { opacity: 1 },
                }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[idx % COLORS.length], flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inv.assetName}
                    </Typography>
                    {inv.estimatedReturn && (
                      <Typography sx={{ fontSize: '11px', color: 'var(--color-success)' }}>
                        {formatPercent(inv.estimatedReturn)} a.a.
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {formatCurrency(inv.financialItem?.amount || 0)}
                    </Typography>
                  </Box>
                  <Box className="inv-actions" sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 150ms' }}>
                    <IconButton size="small" onClick={() => openEdit(inv)} sx={{ borderRadius: '6px', color: 'var(--color-text-secondary)' }}>
                      <EditOutlined sx={{ fontSize: 15 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(inv)} sx={{ borderRadius: '6px', color: 'var(--color-danger)' }}>
                      <DeleteOutlined sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <SideDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} title={editing ? 'Editar Ativo' : 'Novo Investimento'}>
        <InvestmentForm investment={editing ?? undefined} onSave={handleSave} onCancel={() => { setDrawerOpen(false); setEditing(null); }} />
      </SideDrawer>
    </Box>
  );
}
