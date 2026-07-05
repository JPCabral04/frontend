import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ---- Date Formatters ----

export function formatDate(dateStr: string | Date, pattern = 'dd/MM/yyyy'): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, pattern, { locale: ptBR });
}

export function formatDateTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'HH:mm', { locale: ptBR });
}

export function formatRelative(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

export function formatMonthYear(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

export function formatDayMonth(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, "d 'de' MMM", { locale: ptBR });
}

export function getDueDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Hoje';
  if (isTomorrow(date)) return 'Amanhã';
  if (isThisWeek(date)) return format(date, 'EEEE', { locale: ptBR });
  return formatDayMonth(dateStr);
}

export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ---- Currency Formatter ----

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

// ---- Percentage ----

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ---- Progress ----

/** Retorna o progresso com 1 casa decimal (ex: 0.1, 60.5, 100) */
export function calcProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 1000) / 10, 100);
}

/** Formata o progresso para exibição (ex: "0,1%", "60,5%", "100%") */
export function formatProgress(progress: number): string {
  if (progress === 100) return '100%';
  if (progress === 0) return '0%';
  if (progress < 1) return `${progress.toFixed(1).replace('.', ',')}%`;
  return `${Number.isInteger(progress) ? progress : progress.toFixed(1).replace('.', ',')}%`;
}

// ---- Greeting ----

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ---- Priority ----

export function getPriorityLabel(priority?: string): string {
  const map: Record<string, string> = {
    HIGH: 'Alta',
    MEDIUM: 'Média',
    LOW: 'Baixa',
  };
  return map[priority ?? ''] ?? priority ?? '—';
}

export function getPriorityColor(priority?: string): string {
  const map: Record<string, string> = {
    HIGH: 'var(--color-priority-high)',
    MEDIUM: 'var(--color-priority-medium)',
    LOW: 'var(--color-priority-low)',
  };
  return map[priority ?? ''] ?? 'var(--color-text-tertiary)';
}

export function getPriorityBgColor(priority?: string): string {
  const map: Record<string, string> = {
    HIGH: 'var(--color-priority-high-bg)',
    MEDIUM: 'var(--color-priority-medium-bg)',
    LOW: 'var(--color-priority-low-bg)',
  };
  return map[priority ?? ''] ?? 'var(--color-bg-tertiary)';
}
