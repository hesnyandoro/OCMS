import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import FarmLocationPicker from './FarmLocationPicker';

vi.mock('./LocationMap', () => ({
  default: () => <div data-testid="farm-location-map" />,
}));

const geocodeRegion = vi.fn();
vi.mock('../services/geolocationService', () => ({
  geocodeRegion: (...args) => geocodeRegion(...args),
}));

function Harness() {
  const { register, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      weighStation: '',
      farmLocation: { lat: '', lng: '', address: '' },
    },
  });
  const lat = watch('farmLocation.lat');
  const lng = watch('farmLocation.lng');
  return (
    <div>
      <FarmLocationPicker
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
        debounceMs={0}
      />
      <div data-testid="lat-value">{lat === '' || lat == null ? '' : String(lat)}</div>
      <div data-testid="lng-value">{lng === '' || lng == null ? '' : String(lng)}</div>
    </div>
  );
}

describe('FarmLocationPicker', () => {
  beforeEach(() => {
    geocodeRegion.mockReset();
  });

  it('does not look up a region until 3 characters are entered', async () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText(/search region or place/i), { target: { value: 'Ke' } });
    await waitFor(() => expect(geocodeRegion).not.toHaveBeenCalled());

    geocodeRegion.mockResolvedValue({
      success: true,
      results: [{ displayName: 'Kericho, Kenya', lat: -0.367, lng: 35.283 }],
    });
    fireEvent.change(screen.getByLabelText(/search region or place/i), { target: { value: 'Kericho' } });
    await waitFor(() => expect(geocodeRegion).toHaveBeenCalledWith('Kericho'));
    expect(await screen.findByTestId('geocode-results')).toBeInTheDocument();
  });

  it('shows a searching state then a not-found message', async () => {
    let resolveSearch;
    geocodeRegion.mockImplementation(
      () => new Promise((resolve) => {
        resolveSearch = resolve;
      })
    );
    render(<Harness />);
    fireEvent.change(screen.getByLabelText(/search region or place/i), { target: { value: 'xyzplace' } });
    expect(await screen.findByText(/searching kenya/i)).toBeInTheDocument();
    resolveSearch({
      success: true,
      results: [],
      msg: 'No matching place found in Kenya. Enter coordinates manually or pick a point on the map.',
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(/no matching place found/i);
  });

  it('stores lat/lng when a result is chosen and keeps manual fields', async () => {
    geocodeRegion.mockResolvedValue({
      success: true,
      results: [{ displayName: 'Nyeri, Kenya', lat: -0.42, lng: 36.95 }],
    });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText(/search region or place/i), { target: { value: 'Nyeri' } });
    fireEvent.click(await screen.findByRole('button', { name: /nyeri, kenya/i }));
    expect(screen.getByTestId('lat-value').textContent).toBe('-0.42');
    expect(screen.getByTestId('lng-value').textContent).toBe('36.95');
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
  });
});
