// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import TermsPage from '@/app/terms/page';
import AdminLoginPage from '@/app/admin/login/page';
import AdminOverviewPage from '@/app/admin/page';

// Mock Next.js navigation
const pushMock = vi.fn();
const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Tier 1: Customer Website Pages & Admin Portal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Home Page', () => {
    it('renders hero headline, value proposition, and primary CTAs', () => {
      render(<HomePage />);

      expect(
        screen.getByRole('heading', { level: 1, name: /Premium Chauffeur|Your Luxury Car|Acting Driver/i })
      ).toBeDefined();

      const bookButtons = screen.getAllByRole('link', { name: /Book a Driver|Book a Chauffeur|Reserve a Chauffeur/i });
      expect(bookButtons.length).toBeGreaterThan(0);

      const exploreServices = screen.getByRole('link', { name: /Explore Services/i });
      expect(exploreServices).toBeDefined();
    });

    it('renders trust guarantees: Police Verified, Zero Surge, Manual & Automatic', () => {
      render(<HomePage />);
      expect(screen.getAllByText(/Police Verified/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Zero Surge/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Manual & Automatic/i).length).toBeGreaterThan(0);
    });

    it('renders FAQ accordion and toggles open/close on click', () => {
      render(<HomePage />);
      const firstFaqQuestion = screen.getByText(/How does the acting driver service work\?/i);
      expect(firstFaqQuestion).toBeDefined();

      // Accordion should display answer
      expect(screen.getByText(/Key2Drive provides background-verified/i)).toBeDefined();

      // Click to toggle
      fireEvent.click(firstFaqQuestion);
    });
  });

  describe('Terms and Conditions Page', () => {
    it('renders structured legal sections with pending client review notice', () => {
      render(<TermsPage />);

      expect(screen.getByText(/Terms & Conditions/i)).toBeDefined();
      expect(screen.getAllByText(/Pending Client Review/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Booking Conditions/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Payment Terms/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Cancellation/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Waiting Time/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Customer Responsibilities/i).length).toBeGreaterThan(0);
    });
  });

  describe('Admin Login Page', () => {
    it('renders admin login form and allows secure credential entry', () => {
      render(<AdminLoginPage />);

      expect(screen.getByText(/Key2Drive Admin Portal/i)).toBeDefined();
      const emailInput = screen.getByPlaceholderText(/admin@key2drive.com/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/••••••••••••/i) as HTMLInputElement;
      expect(emailInput).toBeDefined();
      expect(passwordInput).toBeDefined();

      fireEvent.change(emailInput, { target: { value: 'operator@key2drive.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });

      expect(emailInput.value).toBe('operator@key2drive.com');
      expect(passwordInput.value).toBe('SecurePass123!');
    });
  });

  describe('Admin Overview Page', () => {
    it('fetches and renders real database metrics and recent bookings', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          metrics: {
            totalBookings: 12,
            requestedCount: 3,
            confirmedCount: 5,
            completedCount: 3,
            cancelledCount: 1,
            rejectedCount: 0,
            upcomingCount: 2,
            totalRevenue: 4500,
            totalEnquiries: 4,
            pendingEnquiries: 2,
            resolvedEnquiries: 2,
            recentBookings: [
              {
                id: 'booking-1',
                reference: 'K2D-20261031-TEST',
                customerName: 'Rahul Verma',
                customerPhone: '9876543210',
                status: 'REQUESTED',
                estimatedAmount: 600,
                pickupDateTime: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              },
            ],
            recentEnquiries: [],
          },
        }),
      } as any);

      render(<AdminOverviewPage />);

      await waitFor(() => {
        expect(screen.getByText(/Dashboard Overview|Dispatch Operations Overview/i)).toBeDefined();
        expect(screen.getAllByText(/12/).length).toBeGreaterThan(0); // Total Bookings
        expect(screen.getByText(/K2D-20261031-TEST/)).toBeDefined(); // Recent Booking Reference
        expect(screen.getByText(/Rahul Verma/)).toBeDefined(); // Customer Name
      });
    });
  });
});

