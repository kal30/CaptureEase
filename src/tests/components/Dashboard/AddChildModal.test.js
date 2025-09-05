import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../testUtils/i18nForTests';
import AddChildModal from '../../../components/Dashboard/AddChildModal';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock Firebase
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(() => Promise.resolve('mock-url'))
}));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
  collection: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id' }
  }))
}));

jest.mock('../../../services/firebase', () => ({
  db: {}
}));

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

describe('AddChildModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with correct title', () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    expect(screen.getByText('Add New profile')).toBeInTheDocument();
  });

  it('renders profile name and age fields', () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    expect(screen.getByLabelText('Profile Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile Age')).toBeInTheDocument();
  });

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddChildModal {...defaultProps} />);
    
    const submitButton = screen.getByText('Add profile');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter the profile name/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty age', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddChildModal {...defaultProps} />);
    
    const nameField = screen.getByLabelText('Profile Name');
    await user.type(nameField, 'Test Child');
    
    const submitButton = screen.getByText('Add profile');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter the profile age/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddChildModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders medical profile section', () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    expect(screen.getByText('📋 Medical & Behavioral Profile')).toBeInTheDocument();
  });

  it('allows adding conditions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddChildModal {...defaultProps} />);
    
    const conditionsField = screen.getByRole('combobox', { name: /primary concerns/i });
    await user.type(conditionsField, 'ADHD');
    
    // This tests the autocomplete functionality
    expect(conditionsField).toHaveValue('ADHD');
  });
});