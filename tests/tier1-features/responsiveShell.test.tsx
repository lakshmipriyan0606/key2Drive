// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { ButtonMotion } from '@/components/ui/ButtonMotion';
import { MAIN_NAV_ITEMS, FOOTER_LEGAL_LINKS, CONTACT_DETAILS } from '@/lib/constants/navigation';

describe('Tier 1: Feature 4 - Responsive Navigation & Shell', () => {
  it('renders Header with luxury brand mark and navigation links', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /Key2Drive Home/i })).toBeDefined();
    expect(screen.getByRole('banner')).toBeDefined();

    // Verify main navigation links exist
    MAIN_NAV_ITEMS.forEach((navItem) => {
      const links = screen.getAllByRole('link', { name: new RegExp(navItem.label, 'i') });
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('renders Header booking CTA button with link to /book', () => {
    render(<Header />);
    const bookCta = screen.getAllByRole('link', { name: /book a driver|book a chauffeur|book/i })[0];
    expect(bookCta).toBeDefined();
    expect(bookCta.getAttribute('href')).toBe('/book');
  });

  it('renders Footer with brand identity, contact info, and legal links', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeDefined();
    expect(screen.getAllByText(/Key2Drive/i).length).toBeGreaterThan(0);

    // Contact info verified
    expect(screen.getByText(CONTACT_DETAILS.phoneDisplay)).toBeDefined();

    // Legal links
    FOOTER_LEGAL_LINKS.forEach((link) => {
      const legalLink = screen.getByRole('link', { name: new RegExp(link.label, 'i') });
      expect(legalLink).toBeDefined();
    });
  });

  it('renders MobileNav drawer when isOpen is true and invokes onClose upon dismiss', () => {
    let closed = false;
    const handleClose = () => {
      closed = true;
    };

    render(<MobileNav isOpen={true} onClose={handleClose} />);

    const dialog = screen.getByRole('dialog', { name: /navigation menu/i });
    expect(dialog).toBeDefined();

    const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
    expect(closeButton).toBeDefined();

    fireEvent.click(closeButton);
    expect(closed).toBe(true);
  });

  it('ButtonMotion renders with accessible focusable button and variant styling', () => {
    render(<ButtonMotion variant="accent">Confirm Booking</ButtonMotion>);
    const button = screen.getByRole('button', { name: /confirm booking/i });
    expect(button).toBeDefined();
    expect(button.className).toContain('#F28C00');
  });

  it('ButtonMotion handles click events and supports disabled state', () => {
    let clicked = false;
    const { rerender } = render(
      <ButtonMotion onClick={() => { clicked = true; }}>
        Action
      </ButtonMotion>
    );

    const button = screen.getByRole('button', { name: /action/i });
    fireEvent.click(button);
    expect(clicked).toBe(true);

    // Disabled state
    clicked = false;
    rerender(
      <ButtonMotion disabled onClick={() => { clicked = true; }}>
        Action
      </ButtonMotion>
    );
    fireEvent.click(button);
    expect(clicked).toBe(false);
  });
});
