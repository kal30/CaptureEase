import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

test('renders the landing page hero', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { level: 1, name: /I have two nephews with autism/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /start tracking free/i })).toBeInTheDocument();
  expect(screen.getByText(/Built for the real moments of caregiving/i)).toBeInTheDocument();
});
