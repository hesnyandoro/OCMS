import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

vi.mock('../components/DeliveryMap', () => ({
  default: ({ farmers }) => (
    <div data-testid="farmers-map">{farmers.map((f) => f.name).join(',')}</div>
  ),
}));

vi.mock('../hooks/useSmartRefresh', () => ({
  useSmartRefresh: () => {},
}));

const get = vi.fn();
vi.mock('../services/api', () => ({
  default: {
    get: (...args) => get(...args),
  },
}));

import FarmerMap from './FarmerMap';

describe('FarmerMap', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('plots farmers that have coordinates and skips empty locations', async () => {
    get.mockResolvedValue({
      data: [
        { _id: '1', name: 'Amina', weighStation: 'Kericho', cellNumber: '0711', farmLocation: { lat: -0.36, lng: 35.28, address: 'Kericho' } },
        { _id: '2', name: 'No Pin', weighStation: 'Kericho', farmLocation: {} },
        { _id: '3', name: 'Zeroed', weighStation: 'Kericho', farmLocation: { lat: 0, lng: 0 } },
      ],
    });

    render(
      <AuthContext.Provider value={{ authState: { role: 'admin', assignedRegion: null } }}>
        <MemoryRouter>
          <FarmerMap />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(get).toHaveBeenCalledWith('/farmers'));
    expect(await screen.findByTestId('farmers-map')).toHaveTextContent('Amina');
    expect(screen.getByTestId('farmers-map')).not.toHaveTextContent('No Pin');
    expect(screen.getByText(/plotted on map/i).parentElement).toHaveTextContent('1');
    expect(screen.getByText(/2 farmers in this view have no usable coordinates/i)).toBeInTheDocument();
  });
});
