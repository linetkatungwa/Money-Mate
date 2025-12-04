import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../../components/StatCard.jsx';

describe('StatCard component', () => {
  it('renders the provided title and amount', () => {
    render(
      <StatCard
        title="Total Savings"
        amount="KES 120,000"
        change={12}
        icon={<span data-testid="icon">💰</span>}
        color="#4CAF50"
      />
    );

    expect(screen.getByText('Total Savings')).toBeInTheDocument();
    expect(screen.getByText('KES 120,000')).toBeInTheDocument();
    expect(screen.getByText(/12%/)).toHaveClass('positive');
  });

  it('shows negative indicator when change is below zero', () => {
    render(
      <StatCard
        title="Monthly Expenses"
        amount="KES 45,000"
        change={-8}
        icon={<span data-testid="icon">💸</span>}
        color="#FF6B6B"
      />
    );

    expect(screen.getByText(/8%/)).toHaveClass('negative');
  });
});

