# Investigation & Remediation Report: MobileNav Accessibility (WCAG 2.1 AA Focus Order) & Transition Elimination

**Agent**: Explorer M1 Iteration 2 - 2 (`explorer`)  
**Parent Agent**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Milestone**: M1 Iteration 2 (Remediation)  
**Date**: 2026-10-31  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\explorer_m1_iter2_2\`  
**Handoff Type**: Hard Handoff  

---

## 1. Observation

Direct observations, file references, line numbers, and tool verification:

### 1.1 Focus Order Failure in `MobileNav.tsx` (WCAG 2.1 AA SC 2.4.3)
In `src/components/layout/MobileNav.tsx`:
- **Initial Focus Setup (lines 80-84)**:
  ```tsx
  // Set initial focus to close button
  const timer = setTimeout(() => {
    closeButtonRef.current?.focus();
  }, 50);
  ```
  Focus is successfully trapped within the drawer while open (lines 48-68).
- **Escape Key Handling (lines 42-46)**:
  ```tsx
  if (e.key === "Escape") {
    e.preventDefault();
    onClose();
    return;
  }
  ```
- **Backdrop Click Handling (lines 132-134)**:
  ```tsx
  onClick={onClose}
  className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm"
  ```
- **Close Button Handling (lines 159-167)**:
  ```tsx
  <button
    ref={closeButtonRef}
    type="button"
    onClick={onClose}
    ...
  >
    <X className="w-6 h-6" aria-hidden="true" />
  </button>
  ```
- **Defect**: When `onClose()` is called via any of these dismiss actions, `isMobileNavOpen` becomes `false` in `Header.tsx`, causing the drawer container and close button to unmount. Because no focus restoration logic exists, the browser resets focus to `document.body` or the top of the viewport. This violates **WCAG 2.1 AA Success Criterion 2.4.3 (Focus Order)** and WAI-ARIA Dialog (Modal) design pattern requirements, which stipulate that upon dialog dismissal, focus MUST return to the invoking trigger element.

### 1.2 Missing Trigger Reference in `Header.tsx`
In `src/components/layout/Header.tsx`:
- **Hamburger Button Definition (lines 120-133)**:
  ```tsx
  <button
    type="button"
    onClick={() => setIsMobileNavOpen((prev) => !prev)}
    className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-brand-navy hover:bg-black/5 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-orange flex items-center justify-center transition-colors"
    aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
    aria-expanded={isMobileNavOpen}
    aria-controls="mobile-navigation-drawer"
  >
  ```
- **Drawer Invocation (lines 139-142)**:
  ```tsx
  <MobileNav
    isOpen={isMobileNavOpen}
    onClose={() => setIsMobileNavOpen(false)}
  />
  ```
- **Defect**: `Header.tsx` maintains no React ref to the mobile navigation toggle button and does not pass a trigger reference to `MobileNav`. Furthermore, `onClose` is passed as an anonymous inline function `() => setIsMobileNavOpen(false)`, causing function re-allocations on each render.

### 1.3 `transition-all` Occurrences in `MobileNav.tsx`
- **Line 163 (Close Button)**:
  ```tsx
  className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-secondary-text hover:text-brand-navy hover:bg-black/5 active:scale-[0.97] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-orange"
  ```
- **Line 199 (Book a Chauffeur Link)**:
  ```tsx
  className="flex items-center justify-center gap-2 w-full min-h-[48px] bg-brand-orange hover:bg-brand-orange/90 active:scale-[0.97] text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
  ```
- **Defect**: `transition-all` animates all CSS properties indiscriminately, violating Emil Kowalski motion design principles by risking unintended layout recalculations during property transitions.

### 1.4 Baseline Verification Output
- `npm run typecheck` (`tsc --noEmit`): Exited with code `0`.
- `npm run lint` (`next lint`): Exited with code `0` (`✔ No ESLint warnings or errors`).

---

## 2. Logic Chain

1. **Focus Order Requirements (WCAG 2.1 AA SC 2.4.3 & WAI-ARIA Modal Pattern)**:
   - When a user interacts with a modal drawer (such as `MobileNav`), focus is trapped inside the component until dismissed or a link is activated.
   - When dismissed by intentional cancel gestures (pressing `Escape`, clicking the backdrop, or clicking the close button), the user expects to continue navigating from the exact location where they initiated the interaction.
   - In `Header.tsx`, the hamburger button invoked the drawer. Therefore, focus must deterministically return to this button when the drawer closes.
2. **Dismissal vs. Navigation Distinction**:
   - If the user clicks a route link (e.g. `<Link href="/tariffs" onClick={onClose}>` or `<Link href="/book" onClick={onClose}>`), the user intends to navigate to a new page.
   - Forcing focus back onto the hamburger button during page navigation would disrupt route transition focus management.
   - Therefore, focus restoration must be explicitly bound to dismissal actions (`Escape`, backdrop click, close button) via a dedicated `handleDismiss()` callback, while navigation link clicks call `onClose()` directly without hijacking focus.
3. **Robust Dual-Fallback Focus Restoration Architecture**:
   - *Primary Mechanism*: In `Header.tsx`, attach a `menuButtonRef = useRef<HTMLButtonElement>(null)` to the hamburger `<button>` and pass `triggerRef={menuButtonRef}` to `<MobileNav />`.
   - *Secondary Fallback*: In `MobileNav.tsx`, record `previousActiveElementRef.current = (document.activeElement as HTMLElement) || null` when `isOpen` becomes `true`. If `triggerRef` is ever omitted or null, focus falls back to `previousActiveElementRef.current`.
   - *Execution Timing*: To guarantee that React 19 state reconciliation and DOM unmounting complete cleanly without race conditions, invoke `restoreFocus()` inside a macrotask tick via `setTimeout(..., 0)`.
4. **Transition Optimization**:
   - On the close button (`line 163`), replacing `transition-all` with `transition-colors duration-150` restricts transitions exclusively to `color` and `background-color` while preserving the active tap state (`active:scale-[0.97]`).
   - On the "Book a Chauffeur" CTA (`line 199`), replacing `transition-all duration-150` with `transition-colors duration-150` aligns directly with the CTA styling across `Header.tsx` and `Footer.tsx`.

---

## 3. Caveats

1. **`Link` vs. `ButtonMotion` on Line 199**:
   - Reviewer feedback noted standardizing on `ButtonMotion`. However, line 199 is a Next.js client `<Link href="/book">`.
   - Nesting a `<ButtonMotion>` (`<motion.button>`) inside Next.js `<Link>` produces an invalid HTML hierarchy (`<button>` inside `<a>`), triggering React runtime warnings.
   - Replacing `<Link>` with a `<ButtonMotion>` that calls `router.push("/book")` sacrifices native anchor capabilities (SEO crawlers, right-click "Open in new tab", middle-click).
   - Therefore, the recommended drop-in fix retains `<Link>` with `transition-colors duration-150`. An alternative `router.push` + `ButtonMotion` implementation is also documented in Section 4 for complete flexibility.
2. **Coordination with Explorer M1 Iteration 2 - 1**:
   - Explorer 1 is concurrently optimizing `Header.tsx` scroll layout padding (`py-3.5`) and header transition classes. The changes proposed here for `Header.tsx` (`menuButtonRef` and `triggerRef`) are strictly additive and will integrate seamlessly with Explorer 1's header modifications.

---

## 4. Conclusion & Drop-In Code Recommendations

### 4.1 Exact Code Changes for `src/components/layout/MobileNav.tsx`

#### Change 1: Extend `MobileNavProps` and Component Signature
**Before (lines 21-26)**:
```tsx
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
```

**After**:
```tsx
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function MobileNav({
  isOpen,
  onClose,
  triggerRef,
}: MobileNavProps) {
```

---

#### Change 2: Add `previousActiveElementRef` and `handleDismiss` Callback
**Before (lines 27-31)**:
```tsx
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
```

**After**:
```tsx
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Restore focus to opening hamburger button upon dismissal (WCAG 2.1 AA SC 2.4.3)
  const handleDismiss = useCallback(() => {
    onClose();
    setTimeout(() => {
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === "function"
      ) {
        previousActiveElementRef.current.focus();
      }
    }, 0);
  }, [onClose, triggerRef]);
```

---

#### Change 3: Update `handleKeyDown` to Use `handleDismiss` on Escape
**Before (lines 38-46)**:
```tsx
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
```

**After**:
```tsx
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
        return;
      }
```
*(Also update dependency array of `handleKeyDown` from `[isOpen, onClose]` to `[isOpen, handleDismiss]`)*

---

#### Change 4: Capture Initial Active Element in `useEffect`
**Before (lines 73-85)**:
```tsx
  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Lock background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Set initial focus to close button
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
```

**After**:
```tsx
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = (document.activeElement as HTMLElement) || null;
      window.addEventListener("keydown", handleKeyDown);
      // Lock background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Set initial focus to close button
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
```

---

#### Change 5: Update Backdrop Click to Use `handleDismiss`
**Before (line 132)**:
```tsx
            onClick={onClose}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm"
```

**After**:
```tsx
            onClick={handleDismiss}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm"
```

---

#### Change 6: Eliminate `transition-all` on Close Button & Bind `handleDismiss`
**Before (lines 159-167)**:
```tsx
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-secondary-text hover:text-brand-navy hover:bg-black/5 active:scale-[0.97] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-orange"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
```

**After**:
```tsx
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleDismiss}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-secondary-text hover:text-brand-navy hover:bg-black/5 active:scale-[0.97] transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-orange"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
```

---

#### Change 7: Eliminate `transition-all` on "Book a Chauffeur" CTA Link
**Before (lines 196-204)**:
```tsx
              <div className="pt-4">
                <Link
                  href="/book"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] bg-brand-orange hover:bg-brand-orange/90 active:scale-[0.97] text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
                >
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                  <span>Book a Chauffeur</span>
                </Link>
              </div>
```

**After**:
```tsx
              <div className="pt-4">
                <Link
                  href="/book"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] bg-brand-orange hover:bg-brand-orange/90 active:scale-[0.97] text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
                >
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                  <span>Book a Chauffeur</span>
                </Link>
              </div>
```

---

### 4.2 Exact Code Changes for `src/components/layout/Header.tsx`

#### Change 1: Import `useRef` and `useCallback`
**Before (line 3)**:
```tsx
import React, { useState, useEffect } from "react";
```

**After**:
```tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
```

---

#### Change 2: Add `menuButtonRef` and Memoized Callbacks
**Before (lines 12-14)**:
```tsx
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
```

**After**:
```tsx
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const handleToggleMobileNav = useCallback(() => {
    setIsMobileNavOpen((prev) => !prev);
  }, []);
```

---

#### Change 3: Attach `ref` to Mobile Menu Hamburger Button
**Before (lines 120-127)**:
```tsx
            {/* Mobile Navigation Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-brand-navy hover:bg-black/5 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-orange flex items-center justify-center transition-colors"
              aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-navigation-drawer"
            >
```

**After**:
```tsx
            {/* Mobile Navigation Toggle Button */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={handleToggleMobileNav}
              className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-brand-navy hover:bg-black/5 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-orange flex items-center justify-center transition-colors"
              aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-navigation-drawer"
            >
```

---

#### Change 4: Pass `triggerRef` and Memoized `onClose` to `MobileNav`
**Before (lines 139-142)**:
```tsx
      {/* Accessible Slide-in Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
```

**After**:
```tsx
      {/* Accessible Slide-in Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={handleCloseMobileNav}
        triggerRef={menuButtonRef}
      />
```

---

## 5. Verification Method

Once Worker M1 Iteration 2 applies these drop-in recommendations, independently verify with:

1. **Verify Complete Elimination of `transition-all` in `MobileNav.tsx`**:
   ```powershell
   rg "transition-all" src/components/layout/MobileNav.tsx
   ```
   *Expected outcome*: 0 occurrences.

2. **Verify TypeScript Compilation**:
   ```powershell
   npm run typecheck
   ```
   *Expected outcome*: Exit code `0` with 0 type errors.

3. **Verify ESLint Validation**:
   ```powershell
   npm run lint
   ```
   *Expected outcome*: Exit code `0` with 0 warnings or errors.

4. **Verify Focus Restoration Flow (Manual or Automated)**:
   - On a mobile viewport (< 768px), navigate using keyboard `Tab` to the hamburger button and press `Enter` / `Space`.
   - Verify initial focus immediately rests on the drawer's Close button (`X`).
   - Press `Escape`: Verify the drawer closes and focus immediately lands back on the hamburger button with a visible focus ring.
   - Re-open drawer, navigate by `Tab` to the Close button, and press `Enter`: Verify drawer closes and focus lands back on the hamburger button.
   - Re-open drawer and click the backdrop: Verify drawer closes and focus lands back on the hamburger button.
   - Re-open drawer, navigate to a link (e.g. `/tariffs`) and press `Enter`: Verify page navigates to `/tariffs` without focus being hijacked back to the header hamburger button.

5. **Invalidation Conditions**:
   - Any compiler error involving `triggerRef` type matching (`React.RefObject<HTMLButtonElement | null>`).
   - Any instance where pressing Escape leaves active focus on `document.body`.
