// components/AutocompleteInput.tsx
"use client";

import React from 'react';

// Define the type for the suggestions, matching the server response
export type Suggestion = { 
  code: string; 
  name: string; 
  type: string 
};

interface AutocompleteInputProps {
  // Required props for the input's state and appearance
  value: string;
  placeholder: string;
  className?: string; // Optional prop to pass tailwind classes for styling

  // Props for logic and communication
  inputType: "departing" | "arriving";
  suggestions: Suggestion[];
  isFocused: boolean;

  // Event Handlers passed from the parent page
  onChange: (e: React.ChangeEvent<HTMLInputElement>, inputType: "departing" | "arriving") => void;
  onSelect: (suggestion: Suggestion, inputType: "departing" | "arriving") => void;
  onFocus: () => void;
  onBlur: () => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  placeholder,
  className,
  inputType,
  onChange,
  onSelect,
  suggestions,
  isFocused,
  onFocus,
  onBlur,
}) => {
  return (
    // The relative wrapper for positioning the dropdown
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e, inputType)}
        onFocus={onFocus}
        onBlur={onBlur} 
        placeholder={placeholder}
        className={`${className || 'border rounded px-3 py-1 w-56'}`} 
      />
      
      {/* The suggestion dropdown list */}
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-[-1px]">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.code}
              className="p-2 hover:bg-blue-100 cursor-pointer text-left"
              // Use onMouseDown to trigger selection before onBlur hides the list
              onMouseDown={() => onSelect(suggestion, inputType)}
            >
              <span className="font-semibold">{suggestion.name}</span>
              <span className="text-sm text-gray-500 ml-2">({suggestion.type})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;