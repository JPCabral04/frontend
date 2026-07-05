
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

// Auth pages
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';

// Dashboard
import { DashboardPage } from './features/dashboard/pages/DashboardPage';

// Agenda
import { AgendaTasksPage } from './features/agenda/pages/AgendaTasksPage';
import { AgendaEventsPage } from './features/agenda/pages/AgendaEventsPage';
import { AgendaCalendarPage } from './features/agenda/pages/AgendaCalendarPage';

// Financeiro
import { TransactionsPage } from './features/finance/pages/TransactionsPage';
import { GoalsPage } from './features/finance/pages/GoalsPage';
import { InvestmentsPage } from './features/finance/pages/InvestmentsPage';

// Hábitos
import { HabitsPage } from './features/habits/pages/HabitsPage';
import { HabitDetailPage } from './features/habits/pages/HabitDetailPage';

// Perfil e Categorias
import { CategoriesPage } from './features/categories/pages/CategoriesPage';
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { SettingsPage } from './features/profile/pages/SettingsPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Protected routes — wrapped in AppShell */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AppShell>
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={
                  <ErrorBoundary fallbackMessage="Erro no Dashboard. Tente recarregar.">
                    <DashboardPage />
                  </ErrorBoundary>
                } />

                {/* Agenda */}
                <Route path="agenda" element={<Navigate to="/agenda/tarefas" replace />} />
                <Route path="agenda/tarefas" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Tarefas.">
                    <AgendaTasksPage />
                  </ErrorBoundary>
                } />
                <Route path="agenda/eventos" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Eventos.">
                    <AgendaEventsPage />
                  </ErrorBoundary>
                } />
                <Route path="agenda/calendario" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Calendário.">
                    <AgendaCalendarPage />
                  </ErrorBoundary>
                } />

                {/* Financeiro */}
                <Route path="financeiro" element={<Navigate to="/financeiro/transacoes" replace />} />
                <Route path="financeiro/transacoes" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Transações.">
                    <TransactionsPage />
                  </ErrorBoundary>
                } />
                <Route path="financeiro/metas" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Metas.">
                    <GoalsPage />
                  </ErrorBoundary>
                } />
                <Route path="financeiro/investimentos" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Investimentos.">
                    <InvestmentsPage />
                  </ErrorBoundary>
                } />

                {/* Hábitos */}
                <Route path="habitos" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Hábitos.">
                    <HabitsPage />
                  </ErrorBoundary>
                } />
                <Route path="habitos/:id" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar detalhes do Hábito.">
                    <HabitDetailPage />
                  </ErrorBoundary>
                } />

                {/* Perfil */}
                <Route path="perfil" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Perfil.">
                    <ProfilePage />
                  </ErrorBoundary>
                } />
                <Route path="perfil/categorias" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Categorias.">
                    <CategoriesPage />
                  </ErrorBoundary>
                } />
                <Route path="perfil/configuracoes" element={
                  <ErrorBoundary fallbackMessage="Erro ao carregar Configurações.">
                    <SettingsPage />
                  </ErrorBoundary>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppShell>
          </PrivateRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
