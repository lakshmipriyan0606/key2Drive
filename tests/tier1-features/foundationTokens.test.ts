import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_SPRINGS,
  TRANSITIONS,
} from '@/lib/motion/motionTokens';
import { accessibleFadeVariants } from '@/lib/motion/useAccessibleMotion';

describe('Tier 1: Feature 1 & 2 - Brand Palette & Design Tokens', () => {
  it('defines the exact brand palette colors in tailwind configuration', () => {
    const tailwindConfigPath = path.resolve(process.cwd(), 'tailwind.config.ts');
    expect(fs.existsSync(tailwindConfigPath)).toBe(true);
    const content = fs.readFileSync(tailwindConfigPath, 'utf-8');

    // Requirement R1 brand palette hex codes
    expect(content).toContain('#11243D'); // Primary navy
    expect(content).toContain('#172F4D'); // Deep navy
    expect(content).toContain('#F28C00'); // Accent orange
    expect(content).toContain('#FAF9F6'); // Warm background
    expect(content).toContain('#FFFFFF'); // White
    expect(content).toContain('#252B33'); // Primary text
    expect(content).toContain('#737B86'); // Secondary text
    expect(content).toContain('#E8E7E3'); // Border
  });

  it('configures all required responsive viewport breakpoints in tailwind', () => {
    const tailwindConfigPath = path.resolve(process.cwd(), 'tailwind.config.ts');
    const content = fs.readFileSync(tailwindConfigPath, 'utf-8');

    // Acceptance criteria viewports: 360px, 390px, 768px, 1024px, 1440px, 1920px
    expect(content).toMatch(/360px/);
    expect(content).toMatch(/390px/);
    expect(content).toMatch(/768px/);
    expect(content).toMatch(/1024px/);
    expect(content).toMatch(/1440px/);
    expect(content).toMatch(/1920px/);
  });
});

describe('Tier 1: Feature 3 & 25 - Emil Kowalski Motion Primitives', () => {
  it('adheres to strict Emil Kowalski duration budget (<300ms for micro-interactions)', () => {
    expect(MOTION_DURATIONS.instant).toBe(0);
    expect(MOTION_DURATIONS.press).toBeLessThanOrEqual(0.18);
    expect(MOTION_DURATIONS.micro).toBeLessThanOrEqual(0.20);
    expect(MOTION_DURATIONS.standard).toBeLessThanOrEqual(0.30);
    expect(MOTION_DURATIONS.deliberate).toBeLessThanOrEqual(0.40);
  });

  it('defines signature cubic-bezier easings without AI ease-in anti-patterns', () => {
    expect(MOTION_EASINGS.easeOut).toBeDefined();
    expect(MOTION_EASINGS.easeOutPunch).toBeDefined();
    expect(Array.isArray(MOTION_EASINGS.easeOutPunch)).toBe(true);
    expect(MOTION_EASINGS.easeOutPunch).toEqual([0.16, 1, 0.3, 1]);
  });

  it('defines critically damped spring configurations for snappy luxury feedback', () => {
    expect(MOTION_SPRINGS.snappy).toBeDefined();
    expect(MOTION_SPRINGS.snappy.type).toBe('spring');
    expect(MOTION_SPRINGS.snappy.stiffness).toBeGreaterThanOrEqual(250);
    expect(MOTION_SPRINGS.snappy.damping).toBeGreaterThanOrEqual(25);
    expect(MOTION_SPRINGS.appleCriticallyDamped.bounce).toBe(0);
  });

  it('correctly adapts motion preferences for prefers-reduced-motion with soft opacity fallbacks', () => {
    expect(TRANSITIONS.reducedFade).toBeDefined();
    expect(TRANSITIONS.reducedFade.duration).toBe(0.15);
    expect(TRANSITIONS.reducedFade.ease).toBe('linear');

    expect(accessibleFadeVariants.hidden).toEqual({ opacity: 0 });
    expect(accessibleFadeVariants.visible).toBeDefined();
    expect(accessibleFadeVariants.exit).toBeDefined();
  });
});

describe('Tier 1: Feature 5 - PROGRESS.md Single Source of Truth', () => {
  it('verifies PROGRESS.md exists at project root and tracks all milestones', () => {
    const progressPath = path.resolve(process.cwd(), 'PROGRESS.md');
    expect(fs.existsSync(progressPath)).toBe(true);
    const content = fs.readFileSync(progressPath, 'utf-8');

    expect(content).toContain('Key2Drive Implementation Progress');
    expect(content).toContain('Milestone 1');
    expect(content).toContain('Milestone 2');
    expect(content).toContain('Milestone 3');
    expect(content).toContain('Milestone 4');
    expect(content).toContain('Milestone 5');
    expect(content).toContain('emil-botanical-motion');
  });
});
