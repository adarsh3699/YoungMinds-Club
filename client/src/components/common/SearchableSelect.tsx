import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline";

interface SelectOption {
	value: string;
	label: string;
}

interface SearchableSelectProps {
	id: string;
	name: string;
	value: string;
	onChange: (e: { target: { name: string; value: string } }) => void;
	options: SelectOption[];
	placeholder?: string;
	searchPlaceholder?: string;
	error?: string;
	required?: boolean;
	label?: string;
	disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
	id,
	name,
	value,
	onChange,
	options,
	placeholder = "Select an option",
	searchPlaceholder = "Search options...",
	error,
	required = false,
	label,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Memoize selected option to avoid finding it on every render
	const selectedOption = useMemo(() => options.find((option) => option.value === value), [options, value]);

	// Memoize display value
	const displayValue = useMemo(
		() => searchTerm || (selectedOption ? selectedOption.label : ""),
		[searchTerm, selectedOption]
	);

	// Memoize filtered options to avoid filtering on every render
	const filteredOptions = useMemo(() => {
		if (!searchTerm) return options;

		const lowerSearchTerm = searchTerm.toLowerCase();
		return options.filter(
			(option) =>
				option.label.toLowerCase().includes(lowerSearchTerm) ||
				option.value.toLowerCase().includes(lowerSearchTerm)
		);
	}, [options, searchTerm]);

	// Close dropdown when clicking outside
	const handleClickOutside = useCallback((event: MouseEvent) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setIsOpen(false);
			setSearchTerm("");
		}
	}, []);

	// Handle input focus - open dropdown and select text
	const handleInputFocus = useCallback(() => {
		if (!disabled) {
			setIsOpen(true);
			if (selectedOption && !searchTerm) {
				setTimeout(() => inputRef.current?.select(), 0);
			}
		}
	}, [disabled, selectedOption, searchTerm]);

	// Handle input change - update search term and open dropdown
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setIsOpen(true);
	}, []);

	// Handle option selection
	const handleSelectOption = useCallback(
		(selectedValue: string) => {
			onChange({ target: { name, value: selectedValue } });
			setIsOpen(false);
			setSearchTerm("");
			inputRef.current?.blur();
		},
		[onChange, name]
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			switch (e.key) {
				case "Escape":
					setIsOpen(false);
					setSearchTerm("");
					inputRef.current?.blur();
					break;
				case "ArrowDown":
					if (!isOpen) setIsOpen(true);
					break;
				case "Backspace":
					if (!searchTerm && value) {
						e.preventDefault();
						onChange({ target: { name, value: "" } });
						setIsOpen(true);
					}
					break;
			}
		},
		[isOpen, searchTerm, value, onChange, name]
	);

	// Setup click outside listener
	useEffect(() => {
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
		return undefined;
	}, [isOpen, handleClickOutside]);

	// Memoize render option function to avoid creating new functions on every render
	const renderOption = useCallback(
		(option: SelectOption, index: number) => {
			const isSelected = option.value === value;
			return (
				<div
					key={option.value}
					className={`cursor-pointer select-none relative py-3 pl-4 pr-10 transition-all duration-200 ease-out group ${
						isSelected
							? "ym-bg-amber-400 ym-text-white shadow-md mx-1 rounded-lg font-medium"
							: "ym-text-card hover:ym-bg-card-hover hover:ym-text-primary hover:scale-[1.01] hover:mx-1 hover:rounded-lg hover:shadow-sm"
					}`}
					onClick={() => handleSelectOption(option.value)}
					style={{ animationDelay: `${index * 20}ms` }}
				>
					<span
						className={`block truncate transition-all duration-200 ${
							isSelected ? "font-medium pl-6" : "font-normal group-hover:translate-x-1"
						}`}
					>
						{option.label}
					</span>

					{isSelected && (
						<span className="absolute inset-y-0 left-0 flex items-center pl-2 animate-scale-in">
							<CheckIcon className="h-4 w-4 ym-text-white drop-shadow-sm" aria-hidden="true" />
						</span>
					)}

					{!isSelected && (
						<div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-r-full" />
					)}
				</div>
			);
		},
		[value, handleSelectOption]
	);

	// Memoize dropdown content to avoid recreating on every render
	const dropdownContent = useMemo(() => {
		if (filteredOptions.length === 0) {
			if (searchTerm) {
				return (
					<>
						<div className="px-4 py-2 text-sm ym-text-muted border-b ym-border-card">
							<span className="text-red-500">No exact matches found</span>
						</div>
						<div
							className="cursor-pointer select-none relative py-3 pl-4 pr-10 transition-all duration-200 ease-out group ym-text-card hover:ym-bg-card-hover hover:ym-text-primary hover:scale-[1.01] hover:mx-1 hover:rounded-lg hover:shadow-sm"
							onClick={() => handleSelectOption("Other")}
						>
							<span className="block truncate transition-all duration-200 font-normal group-hover:translate-x-1">
								Other
							</span>
							<div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-r-full" />
						</div>
					</>
				);
			}
			return <div className="px-4 py-6 text-sm ym-text-muted text-center">No options available</div>;
		}
		return filteredOptions.map(renderOption);
	}, [filteredOptions, searchTerm, handleSelectOption, renderOption]);

	// Memoize input styles to avoid recalculating on every render
	const inputClassName = useMemo(() => {
		const baseClass =
			"w-full text-sm pl-4 pr-10 py-3 rounded-xl transition-all duration-150 ease-out focus:outline-none backdrop-blur-sm";
		const errorClass = error ? "input-error" : "input-base";
		const disabledClass = disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer";
		return `${baseClass} ${errorClass} ym-text-card placeholder-gray-400 font-medium ${disabledClass}`;
	}, [error, disabled]);

	// Memoize chevron styles
	const chevronClassName = useMemo(() => {
		const baseClass = "h-5 w-5 transition-all duration-150";
		if (error) return `${baseClass} text-red-500`;
		if (isOpen) return `${baseClass} ym-text-yellow-600 rotate-180 scale-110`;
		return `${baseClass} ym-text-muted hover:ym-text-primary`;
	}, [error, isOpen]);

	return (
		<div className="relative" ref={dropdownRef}>
			{label && (
				<label htmlFor={id} className="block text-sm font-semibold ym-text-primary mb-2">
					{label}
					{required && <span className="ym-text-yellow-600 ml-1">*</span>}
				</label>
			)}

			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					id={id}
					value={displayValue}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onKeyDown={handleKeyDown}
					placeholder={isOpen ? searchPlaceholder : placeholder}
					disabled={disabled}
					className={inputClassName}
					autoComplete="off"
				/>

				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<ChevronUpDownIcon className={chevronClassName} aria-hidden="true" />
				</div>

				{isOpen && (
					<div
						className="absolute z-[9999] mt-2 w-full"
						style={{ animation: "fadeInUpFast 150ms ease-out forwards" }}
					>
						<div className="ym-bg-card backdrop-blur-xl shadow-2xl max-h-64 rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 border-0">
							<div className="py-2 overflow-auto max-h-60">{dropdownContent}</div>
						</div>
					</div>
				)}
			</div>

			{error && (
				<p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
					{error}
				</p>
			)}
		</div>
	);
};

export default SearchableSelect;
