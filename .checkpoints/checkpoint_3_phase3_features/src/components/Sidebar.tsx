import { Link, useLocation } from '@tanstack/react-router';
import { styled } from 'styled-components';
import { LayoutDashboard, FileText, Settings, Briefcase } from 'lucide-react';
import type { Project } from '../db/memoryStore';

const SidebarContainer = styled.div`
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

const ProjectsLabel = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.light};
  font-weight: 700;
  margin-top: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const ProjectItem = styled(NavItem)`
  padding: 6px ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  gap: 8px;
`;

export default function Sidebar({ projects }: { projects: Project[] }) {
  const location = useLocation();
  
  return (
    <SidebarContainer>
      <Logo>
        <span style={{ fontSize: '24px' }}>🥞</span> Pancake
      </Logo>
      <nav>
        <NavItem to="/" activeProps={{ className: 'active' }} activeOptions={{ exact: true }}>
          <LayoutDashboard size={20} /> Dashboard
        </NavItem>
        
        <ProjectsLabel>Projects</ProjectsLabel>
        {projects.map(p => {
          const isActive = location.pathname.startsWith(`/projects/${p.id}`);
          return (
            <ProjectItem 
              key={p.id} 
              to={`/projects/${p.id}/board`} 
              className={isActive ? 'active' : ''}
            >
              <Briefcase size={16} /> {p.name}
            </ProjectItem>
          );
        })}

        <ProjectsLabel>Knowledge Base</ProjectsLabel>
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
