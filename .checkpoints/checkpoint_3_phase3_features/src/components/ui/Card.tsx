import { styled } from 'styled-components';

export const Card = styled.div<{ $glass?: boolean; $clickable?: boolean }>`
  background: ${({ theme, $glass }) => ($glass ? theme.colors.surfaceElevated : theme.colors.surface)};
  backdrop-filter: ${({ $glass }) => ($glass ? 'blur(10px)' : 'none')};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme, $glass }) => ($glass ? theme.shadows.glass : theme.shadows.sm)};
  border: 1px solid ${({ theme, $glass }) => ($glass ? 'rgba(255,255,255,0.2)' : theme.colors.border)};
  transition: all ${({ theme }) => theme.transitions.default};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  ${({ $clickable, theme }) =>
    $clickable &&
    `
    &:hover {
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
    }
  `}
`;
