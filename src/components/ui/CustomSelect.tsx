"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
  dropdownWidth?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  required,
  error,
  className = "",
  id,
  size = "md",
  dropdownWidth,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-xs rounded-xl",
    md: "px-3.5 py-2.5 text-sm rounded-xl",
    lg: "px-4 py-3 text-sm rounded-2xl",
  }[size];

  const optionPadding = {
    sm: "p-2 rounded-lg text-xs",
    md: "p-2.5 rounded-xl text-xs sm:text-sm",
    lg: "p-3 rounded-xl text-sm",
  }[size];

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-brand-navy tracking-tight font-sans"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Custom Luxury Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full ${sizeClasses} border text-left flex items-center justify-between transition-[border-color,box-shadow,background-color] duration-200 bg-white shadow-xs group cursor-pointer ${
          isOpen
            ? "border-brand-orange ring-2 ring-brand-orange/20 shadow-md"
            : error
            ? "border-red-400 bg-red-50/20"
            : "border-brand-border hover:border-brand-orange/50 hover:shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {selectedOption?.icon && (
            <span className="text-brand-orange shrink-0">{selectedOption.icon}</span>
          )}
          <div className="min-w-0">
            {selectedOption ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-navy truncate">
                  {selectedOption.label}
                </span>
                {selectedOption.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      selectedOption.badgeColor || "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                    }`}
                  >
                    {selectedOption.badge}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-secondary-text font-normal">{placeholder}</span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-brand-navy/60 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-orange" : "group-hover:text-brand-orange"
          }`}
        />
      </button>

      {/* Custom Luxury Animated Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 top-full mt-1.5 z-50 bg-white border border-brand-border/90 rounded-2xl shadow-2xl p-1.5 max-h-72 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
            dropdownWidth || "w-full"
          }`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`${optionPadding} cursor-pointer flex items-center justify-between transition-colors duration-150 group ${
                  isSelected
                    ? "bg-brand-navy text-white font-semibold shadow-xs"
                    : "hover:bg-amber-500/10 text-brand-navy hover:text-brand-orange"
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <span className={isSelected ? "text-brand-orange" : "text-brand-navy/60 group-hover:text-brand-orange"}>
                        {option.icon}
                      </span>
                    )}
                    <span className="font-semibold truncate block">
                      {option.label}
                    </span>
                    {option.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : option.badgeColor || "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                        }`}
                      >
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <p
                      className={`text-[11px] mt-0.5 leading-tight ${
                        isSelected ? "text-white/70" : "text-secondary-text"
                      }`}
                    >
                      {option.description}
                    </p>
                  )}
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-brand-orange shrink-0 stroke-[2.5]" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
