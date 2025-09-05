import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import i18n from '../testUtils/i18nForTests';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the entire Dashboard flow
import Dashboard from '../../pages/Dashboard';

// Comprehensive Firebase mocking
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-user-123',
      displayName: 'Test User',
      email: 'test@example.com'
    },
    onAuthStateChanged: jest.fn((callback) => {
      callback({
        uid: 'test-user-123',
        displayName: 'Test User',
        email: 'test@example.com'
      });
      return jest.fn(); // unsubscribe function
    })
  }))
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    forEach: jest.fn((callback) => {
      // Mock child data
      callback({
        id: 'child1',
        data: () => ({
          name: 'Emma',
          age: '5',
          users: {
            care_owner: 'test-user-123',
            care_partners: [],
            caregivers: [],
            therapists: []
          }
        })
      });
      callback({
        id: 'child2', 
        data: () => ({
          name: 'Alex',
          age: '8',
          users: {
            care_owner: 'test-user-123',
            care_partners: [],
            caregivers: [],
            therapists: []
          }
        })
      });
    })
  })),
  addDoc: jest.fn(() => Promise.resolve({ id: 'new-child-id' })),
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve())
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/photo.jpg'))
}));

jest.mock('../../services/firebase', () => ({
  db: {}
}));

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays children from Firebase', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Emma')).toBeInTheDocument();
      expect(screen.getByText('Alex')).toBeInTheDocument();
    });
  });

  it('opens Add Child modal and creates new profile', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    // Click Add Child button
    const addButton = screen.getByText(/add.*profile/i);
    await user.click(addButton);

    // Fill out form
    const nameField = screen.getByLabelText('Profile Name');
    const ageField = screen.getByLabelText('Profile Age');
    
    await user.type(nameField, 'New Child');
    await user.type(ageField, '3');

    // Submit form
    const submitButton = screen.getByText('Add profile');
    await user.click(submitButton);

    // Verify Firebase was called
    await waitFor(() => {
      expect(require('firebase/firestore').addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'New Child',
          age: '3'
        })
      );
    });
  });

  it('handles edit profile workflow', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    // Open child management menu
    const menuButtons = screen.getAllByRole('button');
    const childMenuButton = menuButtons.find(btn => btn.getAttribute('aria-label') === 'child-settings');
    
    if (childMenuButton) {
      await user.click(childMenuButton);
    }

    // Look for edit option
    const editOption = screen.getByText(/edit/i);
    await user.click(editOption);

    // Update name
    const nameField = screen.getByDisplayValue('Emma');
    await user.clear(nameField);
    await user.type(nameField, 'Emma Updated');

    // Save changes
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    await waitFor(() => {
      expect(require('firebase/firestore').updateDoc).toHaveBeenCalled();
    });
  });

  it('handles care team member management', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    // Test invite team member functionality
    const inviteButton = screen.getByText(/invite/i);
    await user.click(inviteButton);

    // Fill invite form
    const emailField = screen.getByLabelText(/email/i);
    await user.type(emailField, 'caregiver@example.com');

    const sendButton = screen.getByText(/send.*invitation/i);
    await user.click(sendButton);

    // Verify invitation process
    await waitFor(() => {
      // Check that appropriate service calls were made
      expect(screen.getByText(/invitation sent/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles i18n profile terminology consistently', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    // Check that all text uses "profile" terminology
    expect(screen.queryByText(/child/i)).not.toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
  });
});