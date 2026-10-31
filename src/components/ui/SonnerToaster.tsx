"use client";

/**
 * Key2Drive Emil Kowalski Sonner Toaster Component
 * Mounted once in the universal root layout (src/app/layout.tsx).
 * Path: src/components/ui/SonnerToaster.tsx
 */

import React from "react";
import { Toaster as SonnerPrimitive } from "sonner";

export const SonnerToaster: React.FC = () => {
  return (
    <SonnerPrimitive
      position="top-right"
      offset={32}
      mobileOffset={16}
      closeButton
      duration={4000}
      richColors={false}
      toastOptions={{
        className:
          "!bg-[#11243D] !text-white !border !border-[#172F4D] !rounded-2xl !shadow-2xl !p-4 !font-sans",
        classNames: {
          title: "!font-semibold !text-white !text-sm",
          description: "!text-[#FAF9F6]/80 !text-xs !mt-1 !leading-relaxed",
          actionButton:
            "!bg-[#F28C00] !text-white !font-semibold !text-xs !rounded-lg !px-3 !py-1.5 hover:!bg-[#d97d00] transition-colors",
          cancelButton:
            "!bg-white/10 !text-white !font-medium !text-xs !rounded-lg !px-3 !py-1.5 hover:!bg-white/20 transition-colors",
          closeButton:
            "!bg-[#172F4D] !border-none !text-white hover:!bg-[#11243D] transition-colors",
        },
      }}
    />
  );
};

export default SonnerToaster;
