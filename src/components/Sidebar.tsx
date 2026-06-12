import { Link } from '@tanstack/react-router';
import styled from 'styled-components';
import { LayoutDashboard, CheckSquare, FileText, Settings } from 'lucide-react';

const SidebarContainer = styled.aside`
  width: 260px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.light};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.default};

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
    color: ${({ theme }) => theme.colors.text.main};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primary}15;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

export default function Sidebar() {
  return (
    <SidebarContainer>
      <Logo>
        <span style={{ fontSize: '24px' }}>🥞</span> Pancake
      </Logo>
      <nav>
        <NavItem to="/" activeProps={{ className: 'active' }} activeOptions={{ exact: true }}>
          <LayoutDashboard size={20} /> Dashboard
        </NavItem>
        <NavItem to="/projects/proj-1/board" activeProps={{ className: 'active' }}>
          <CheckSquare size={20} /> Board
        </NavItem>
        <NavItem to="/docs" activeProps={{ className: 'active' }}>
          <FileText size={20} /> Docs
        </NavItem>
      </nav>
      <Spacer />
      <NavItem to="/about" activeProps={{ className: 'active' }}>
        <Settings size={20} /> Settings
      </NavItem>
    </SidebarContainer>
  );
}
