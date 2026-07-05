import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  DashboardOutlined,
  CalendarTodayOutlined,
  CheckBoxOutlined,
  EventOutlined,
  AccountBalanceWalletOutlined,
  SwapHorizOutlined,
  TrackChangesOutlined,
  ShowChartOutlined,
  FitnessCenterOutlined,
  SettingsOutlined,
  CategoryOutlined,
  AutoAwesome,
  ChevronLeft,
  ChevronRight,
  PersonOutlined,
} from '@mui/icons-material';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardOutlined sx={{ fontSize: 20 }} />,
  },
  {
    label: 'Agenda',
    path: '/agenda',
    icon: <CalendarTodayOutlined sx={{ fontSize: 20 }} />,
    children: [
      { label: 'Tarefas', path: '/agenda/tarefas', icon: <CheckBoxOutlined sx={{ fontSize: 18 }} /> },
      { label: 'Eventos', path: '/agenda/eventos', icon: <EventOutlined sx={{ fontSize: 18 }} /> },
      { label: 'Calendário', path: '/agenda/calendario', icon: <CalendarTodayOutlined sx={{ fontSize: 18 }} /> },
    ],
  },
  {
    label: 'Financeiro',
    path: '/financeiro',
    icon: <AccountBalanceWalletOutlined sx={{ fontSize: 20 }} />,
    children: [
      { label: 'Transações', path: '/financeiro/transacoes', icon: <SwapHorizOutlined sx={{ fontSize: 18 }} /> },
      { label: 'Metas', path: '/financeiro/metas', icon: <TrackChangesOutlined sx={{ fontSize: 18 }} /> },
      { label: 'Investimentos', path: '/financeiro/investimentos', icon: <ShowChartOutlined sx={{ fontSize: 18 }} /> },
    ],
  },
  {
    label: 'Hábitos',
    path: '/habitos',
    icon: <FitnessCenterOutlined sx={{ fontSize: 20 }} />,
  },
];

const bottomItems: NavItem[] = [
  {
    label: 'Categorias',
    path: '/perfil/categorias',
    icon: <CategoryOutlined sx={{ fontSize: 20 }} />,
  },
  {
    label: 'Perfil',
    path: '/perfil',
    icon: <PersonOutlined sx={{ fontSize: 20 }} />,
  },
  {
    label: 'Configurações',
    path: '/perfil/configuracoes',
    icon: <SettingsOutlined sx={{ fontSize: 20 }} />,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['/agenda', '/financeiro']);

  const toggleGroup = (path: string) => {
    setExpandedGroups((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isExactActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ ...styles.sidebar, width: collapsed ? 64 : 240 }}>
      {/* Logo */}
      <Box sx={styles.logoArea}>
        <AutoAwesome sx={{ fontSize: 22, color: 'hsl(245, 85%, 65%)', flexShrink: 0 }} />
        {!collapsed && (
          <Typography sx={styles.logoText}>MySelf</Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'var(--color-border)', mb: 1 }} />

      {/* Main Navigation */}
      <Box sx={styles.navSection} component="nav">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const groupActive = isActive(item.path);
          const expanded = expandedGroups.includes(item.path);

          return (
            <Box key={item.path}>
              {hasChildren ? (
                <>
                  <Tooltip title={collapsed ? item.label : ''} placement="right">
                    <Box
                      onClick={() => !collapsed && toggleGroup(item.path)}
                      sx={{
                        ...styles.navItem,
                        ...(groupActive ? styles.navItemActive : {}),
                        justifyContent: collapsed ? 'center' : 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ color: groupActive ? 'hsl(245, 85%, 65%)' : 'var(--color-text-secondary)', flexShrink: 0 }}>
                          {item.icon}
                        </Box>
                        {!collapsed && (
                          <Typography sx={{ ...styles.navLabel, fontWeight: groupActive ? 600 : 400 }}>
                            {item.label}
                          </Typography>
                        )}
                      </Box>
                      {!collapsed && (
                        <Box sx={{ color: 'var(--color-text-tertiary)', fontSize: 16, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
                          ▾
                        </Box>
                      )}
                    </Box>
                  </Tooltip>

                  {/* Children */}
                  {!collapsed && expanded && (
                    <Box sx={styles.childrenWrapper}>
                      {item.children!.map((child) => (
                        <NavLink key={child.path} to={child.path} style={{ textDecoration: 'none' }}>
                          <Box
                            sx={{
                              ...styles.childItem,
                              ...(isExactActive(child.path) || isActive(child.path) ? styles.childItemActive : {}),
                            }}
                          >
                            <Box sx={{ color: isActive(child.path) ? 'hsl(245, 85%, 65%)' : 'var(--color-text-tertiary)', flexShrink: 0 }}>
                              {child.icon}
                            </Box>
                            <Typography sx={{ ...styles.navLabel, fontSize: '13px' }}>
                              {child.label}
                            </Typography>
                          </Box>
                        </NavLink>
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <NavLink to={item.path} style={{ textDecoration: 'none' }}>
                    <Box
                      sx={{
                        ...styles.navItem,
                        ...(isExactActive(item.path) ? styles.navItemActive : {}),
                        justifyContent: collapsed ? 'center' : 'flex-start',
                      }}
                    >
                      <Box sx={{ color: isExactActive(item.path) ? 'hsl(245, 85%, 65%)' : 'var(--color-text-secondary)', flexShrink: 0 }}>
                        {item.icon}
                      </Box>
                      {!collapsed && (
                        <Typography sx={{ ...styles.navLabel, fontWeight: isExactActive(item.path) ? 600 : 400 }}>
                          {item.label}
                        </Typography>
                      )}
                    </Box>
                  </NavLink>
                </Tooltip>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ borderColor: 'var(--color-border)', mb: 1 }} />
        {bottomItems.map((item) => (
          <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
            <NavLink to={item.path} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  ...styles.navItem,
                  ...(isExactActive(item.path) ? styles.navItemActive : {}),
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <Box sx={{ color: isExactActive(item.path) ? 'hsl(245, 85%, 65%)' : 'var(--color-text-secondary)', flexShrink: 0 }}>
                  {item.icon}
                </Box>
                {!collapsed && (
                  <Typography sx={{ ...styles.navLabel, fontWeight: isExactActive(item.path) ? 600 : 400 }}>
                    {item.label}
                  </Typography>
                )}
              </Box>
            </NavLink>
          </Tooltip>
        ))}

        {/* Collapse toggle */}
        <Box sx={styles.collapseBtn} onClick={onToggle}>
          {collapsed
            ? <ChevronRight sx={{ fontSize: 18, color: 'var(--color-text-secondary)' }} />
            : <ChevronLeft sx={{ fontSize: 18, color: 'var(--color-text-secondary)' }} />}
          {!collapsed && (
            <Typography sx={{ ...styles.navLabel, fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
              Recolher
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  sidebar: {
    height: '100vh',
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 8px 16px',
    transition: 'width 250ms ease',
    overflow: 'hidden',
    flexShrink: 0,
    zIndex: 100,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1,
    height: 64,
    overflow: 'hidden',
  },
  logoText: {
    fontSize: '17px',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.5px',
    whiteSpace: 'nowrap',
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    pt: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 1.5,
    py: 1,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
    minHeight: 40,
    '&:hover': {
      background: 'var(--color-surface-hover)',
    },
  },
  navItemActive: {
    background: 'var(--color-accent-subtle)',
    '&:hover': {
      background: 'var(--color-accent-subtle)',
    },
  },
  childrenWrapper: {
    ml: 1,
    pl: 1,
    borderLeft: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
    mb: 0.5,
  },
  childItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 1.5,
    py: 0.75,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
    '&:hover': {
      background: 'var(--color-surface-hover)',
    },
  },
  childItemActive: {
    background: 'var(--color-accent-subtle)',
  },
  navLabel: {
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  collapseBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1.5,
    py: 1,
    mt: 0.5,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 150ms',
    '&:hover': {
      background: 'var(--color-surface-hover)',
    },
  },
};
