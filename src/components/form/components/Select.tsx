import React, { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  searchable?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options = [],
  placeholder = "Select an option",
  onChange = () => {},
  className = "",
  defaultValue = "",
  searchable = false,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange?.(value);
    setDropdownOpen(false);
    setSearchTerm("");
  };

  const filteredOptions = (options || []).filter((option) =>
    option?.label && option.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

return (
  <div className={`relative ${className}`} ref={dropdownRef}>
    <button
      type="button"
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
        ${selectedValue ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"}
        truncate`}
      onClick={() => setDropdownOpen((prev) => !prev)}
    >
      <span className="inline-block w-full truncate">
        {selectedValue
          ? options.find((opt) => opt?.value === selectedValue)?.label || placeholder
          : placeholder}
      </span>
    </button>

    {dropdownOpen && (
      <div className="absolute z-50 mt-1 w-full min-w-[12rem] max-w-screen-sm rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
        {searchable && (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-t-lg border-b border-gray-200 px-3 text-sm focus:border-brand-300 focus:ring-1 focus:ring-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Search..."
          />
        )}
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value ?? option.label}
                onClick={() => handleSelect(option.value)}
                className={`cursor-pointer px-4 py-2 text-sm dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 
                  ${selectedValue === option.value ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              >
                <span className="block break-words whitespace-normal">{option.label}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No options found.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default Select;
