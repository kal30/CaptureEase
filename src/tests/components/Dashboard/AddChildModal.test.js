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
  collection: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve())
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id' }
  }))
}));

const { getAuth } = require('firebase/auth');

jest.mock('../../../services/firebase', () => ({
  db: {}
}));

jest.mock('../../../components/Dashboard/ChildPhotoUploader', () => ({
  __esModule: true,
  default: ({ label }) => <div>{label || 'Profile photo'}</div>,
}));

jest.mock('../../../components/UI', () => {
  return {
    ThemeSpacing: ({ children }) => <div>{children}</div>,
    CustomizableAutocomplete: ({ label }) => <div>{label}</div>,
    LogFormShell: ({ title, children, footer, onClose }) => (
      <div>
        <h1>{title}</h1>
        <button type="button" aria-label="close" onClick={onClose}>close</button>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ),
    EnhancedLoadingButton: ({ children, onClick, ...props }) => (
      <button type={props.type || 'button'} onClick={onClick}>
        {children}
      </button>
    ),
  };
});

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
    getAuth.mockReturnValue({
      currentUser: { uid: 'test-user-id' },
    });
  });

  it('renders modal with correct title', () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    expect(screen.getByText('Add New profile')).toBeInTheDocument();
  });

  it('renders the fast intake fields', () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    expect(screen.getByLabelText('Profile Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile Age / DOB')).toBeInTheDocument();
    expect(screen.getByText('Create & Start Logging')).toBeInTheDocument();
  });

  it('shows validation error for empty name', async () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    
    const submitButton = screen.getByText('Create & Start Logging');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter the profile name/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty age', async () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    
    const nameField = screen.getByLabelText('Profile Name');
    await userEvent.type(nameField, 'Test Child');
    
    const submitButton = screen.getByText('Create & Start Logging');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter the profile age/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('transitions to the setup panel after creating a profile', async () => {
    renderWithProviders(<AddChildModal {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText('Profile Name'), 'Test Child');
    await userEvent.type(screen.getByLabelText('Profile Age / DOB'), '7');
    await userEvent.click(screen.getByText('Create & Start Logging'));

    await waitFor(() => {
      expect(screen.getByText('Profile Created!')).toBeInTheDocument();
      expect(screen.getByText('Skip to Dashboard')).toBeInTheDocument();
    });
  });
});
