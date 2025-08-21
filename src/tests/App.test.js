import { render, screen } from '@testing-library/react';
import App from '../App';

jest.mock('react-slick', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Slider</div>;
    },
  };
});

test('renders the landing page', () => {
  render(<App />);
  const linkElement = screen.getByText(/About Us/i);
  expect(linkElement).toBeInTheDocument();
});
