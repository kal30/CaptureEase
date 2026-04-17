import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChildCardHeader from '../../../components/Dashboard/ChildCard/ChildCardHeader';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: jest.fn(() => false),
  };
});

jest.mock('../../../services/childAccessService', () => ({
  getChildCareTeam: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../../../components/UI/ChildAvatar', () => ({
  __esModule: true,
  default: () => <div data-testid="child-avatar" />,
}));

jest.mock('../../../components/UI/CareTeamDisplay', () => ({
  __esModule: true,
  default: () => <div data-testid="care-team-display" />,
}));

jest.mock('../../../components/Dashboard/ChildManagementMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="child-management-menu" />,
}));

jest.mock('../../../components/Dashboard/ChildCard/MedicalInfoDisplay', () => ({
  __esModule: true,
  default: () => <div data-testid="medical-info-display" />,
}));

const theme = createTheme();

const renderWithTheme = (ui) =>
  render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );

describe('ChildCardHeader', () => {
  it('shows the profile completion nudge and opens edit profile', async () => {
    const onEditChild = jest.fn();
    const child = {
      id: 'child-1',
      name: 'Test Child',
      age: '7',
      profileSetup: {
        stage: 'intake',
        completed: false,
      },
    };

    renderWithTheme(
      <ChildCardHeader
        child={child}
        userRole="care_owner"
        canAddData
        completedToday={false}
        timelineSummary={{ todayCount: 1, weekCount: 1, activityStreak: 1 }}
        onEditChild={onEditChild}
      />
    );

    expect(screen.getByText('Profile 20% complete')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish profile' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Finish profile' }));

    expect(onEditChild).toHaveBeenCalledWith(child);
  });

  it('does not show the nudge when setup is complete', () => {
    const child = {
      id: 'child-2',
      name: 'Ready Child',
      age: '8',
      profileSetup: {
        stage: 'complete',
        completed: true,
      },
    };

    renderWithTheme(
      <ChildCardHeader
        child={child}
        userRole="care_owner"
        canAddData
        completedToday={false}
        onEditChild={jest.fn()}
      />
    );

    expect(screen.queryByText('Profile 20% complete')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finish profile' })).not.toBeInTheDocument();
  });
});
