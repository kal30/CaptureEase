import React from 'react';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../testUtils/i18nForTests';
import MemberChip from '../../../components/UI/MemberChip';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </I18nextProvider>
  );
};

describe('MemberChip', () => {
  const mockMember = {
    userId: 'user123',
    name: 'John Doe',
    displayName: 'John Doe',
    role: 'Care Owner'
  };

  it('displays member name correctly', () => {
    renderWithProviders(<MemberChip member={mockMember} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('shows "me" when current user matches member', () => {
    renderWithProviders(
      <MemberChip member={mockMember} currentUserId="user123" />
    );
    expect(screen.getByText('me')).toBeInTheDocument();
  });

  it('displays role emoji for Care Owner', () => {
    renderWithProviders(<MemberChip member={mockMember} variant="detailed" />);
    expect(screen.getByText('👑')).toBeInTheDocument();
  });

  it('falls back to Team Member when no name provided', () => {
    const memberNoName = { ...mockMember, name: undefined, displayName: undefined };
    renderWithProviders(<MemberChip member={memberNoName} variant="detailed" />);
    expect(screen.getByText('Team Member')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockClick = jest.fn();
    renderWithProviders(
      <MemberChip member={mockMember} onClick={mockClick} />
    );
    
    const chip = screen.getByRole('button');
    chip.click();
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});