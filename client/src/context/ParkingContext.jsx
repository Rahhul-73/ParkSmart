/**
 * Parking Context  (PO5 — Context API for parking state)
 *
 * Manages parking slots, bookings, and filters.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ParkingContext = createContext(null);

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) throw new Error('useParking must be used within ParkingProvider');
  return context;
};

export const ParkingProvider = ({ children }) => {
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', zone: '', status: '' });

  // ─── Fetch all slots ───
  const fetchSlots = useCallback(async (queryFilters = {}) => {
    setSlotsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries({ ...filters, ...queryFilters }).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const { data } = await api.get(`/parking/slots?${params}`);
      setSlots(data.data.slots);
    } catch (error) {
      toast.error('Failed to load parking slots');
    } finally {
      setSlotsLoading(false);
    }
  }, [filters]);

  // ─── Fetch user's bookings ───
  const fetchMyBookings = useCallback(async (status = '') => {
    setBookingsLoading(true);
    try {
      const params = status ? `?status=${status}` : '';
      const { data } = await api.get(`/bookings/my${params}`);
      setMyBookings(data.data.bookings);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  // ─── Create booking ───
  const createBooking = useCallback(async (bookingData) => {
    try {
      const { data } = await api.post('/bookings', bookingData);
      toast.success('Booking created! 🅿️');
      return data.data.booking;
    } catch (error) {
      const message = error.response?.data?.message || 'Booking failed';
      toast.error(message);
      throw error;
    }
  }, []);

  // ─── Cancel booking ───
  const cancelBooking = useCallback(async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled');
      setMyBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (error) {
      toast.error('Failed to cancel booking');
      throw error;
    }
  }, []);

  const value = {
    slots,
    myBookings,
    slotsLoading,
    bookingsLoading,
    filters,
    setFilters,
    fetchSlots,
    fetchMyBookings,
    createBooking,
    cancelBooking,
  };

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
};

export default ParkingContext;
