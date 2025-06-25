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

	// Memoize filtered options to avoid recalculating on every render
	const filteredOptions = useMemo(() => {
		if (!searchTerm) return options;

		const lowerSearchTerm = searchTerm.toLowerCase();
		return options.filter(
			(option) =>
				option.label.toLowerCase().includes(lowerSearchTerm) ||
				option.value.toLowerCase().includes(lowerSearchTerm)
		);
	}, [searchTerm, options]);

	// Show "Other" option when no matches found
	const showOtherOption = useMemo(() => {
		return filteredOptions.length === 0 && searchTerm.length > 0;
	}, [filteredOptions.length, searchTerm.length]);

	// Memoize selected option to avoid finding it on every render
	const selectedOption = useMemo(() => options.find((option) => option.value === value), [options, value]);

	// Memoize display value calculation
	const displayValue = useMemo(() => {
		if (isOpen && searchTerm) return searchTerm;
		return selectedOption ? selectedOption.label : "";
	}, [isOpen, searchTerm, selectedOption]);

	// Memoize input placeholder
	const inputPlaceholder = useMemo(
		() => (isOpen ? searchPlaceholder : placeholder),
		[isOpen, searchPlaceholder, placeholder]
	);

	// Memoize input className to avoid recalculating
	const inputClassName = useMemo(
		() =>
			`w-full text-sm pl-4 pr-10 py-3 rounded-xl transition-all duration-150 ease-out focus:outline-none backdrop-blur-sm ${
				error ? "input-error" : "input-base"
			} ym-text-card placeholder-gray-400 font-medium ${
				disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
			}`,
		[error, disabled]
	);

	// Memoize chevron className
	const chevronClassName = useMemo(
		() =>
			`h-5 w-5 transition-all duration-150 ${
				error
					? "text-red-500"
					: isOpen
					? "ym-text-yellow-600 rotate-180 scale-110"
					: "ym-text-muted hover:ym-text-primary"
			}`,
		[error, isOpen]
	);

	// Optimize event handlers with useCallback
	const handleClickOutside = useCallback((event: MouseEvent) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setIsOpen(false);
			setSearchTerm("");
		}
	}, []);

	const handleInputFocus = useCallback(() => {
		if (!disabled) {
			setIsOpen(true);
		}
	}, [disabled]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newSearchTerm = e.target.value;
			setSearchTerm(newSearchTerm);
			if (!isOpen) {
				setIsOpen(true);
			}
		},
		[isOpen]
	);

	const handleSelectOption = useCallback(
		(selectedValue: string) => {
			onChange({
				target: {
					name,
					value: selectedValue,
				},
			});
			setIsOpen(false);
			setSearchTerm("");
			if (inputRef.current) {
				inputRef.current.blur();
			}
		},
		[onChange, name]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
				setSearchTerm("");
				if (inputRef.current) {
					inputRef.current.blur();
				}
			} else if (e.key === "ArrowDown" && !isOpen) {
				setIsOpen(true);
			}
		},
		[isOpen]
	);

	// Optimize click outside effect
	useEffect(() => {
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
		return undefined;
	}, [isOpen, handleClickOutside]);

	// Memoize option click handler to avoid creating new functions on each render
	const createOptionClickHandler = useCallback(
		(optionValue: string) => () => handleSelectOption(optionValue),
		[handleSelectOption]
	);

	return (
		<div className="relative" ref={dropdownRef}>
			{label && (
				<label htmlFor={id} className="block text-sm font-semibold ym-text-primary mb-2">
					{label}
					{required && <span className="ym-text-yellow-600 ml-1">*</span>}
				</label>
			)}

			<div className="relative">
				{/* Main Input Field */}
				<input
					ref={inputRef}
					type="text"
					id={id}
					value={displayValue}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onKeyDown={handleKeyDown}
					placeholder={inputPlaceholder}
					disabled={disabled}
					className={inputClassName}
					autoComplete="off"
				/>

				{/* Chevron Icon */}
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<ChevronUpDownIcon className={chevronClassName} aria-hidden="true" />
				</div>

				{/* Dropdown Menu */}
				{isOpen && (
					<div
						className="absolute z-[9999] mt-2 w-full"
						style={{
							animation: "fadeInUpFast 150ms ease-out forwards",
						}}
					>
						<div className="ym-bg-card backdrop-blur-xl shadow-2xl max-h-64 rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 border-0">
							<div className="py-2 overflow-auto max-h-60">
								{filteredOptions.length === 0 ? (
									showOtherOption ? (
										<>
											{/* No matches found header */}
											<div className="px-4 py-2 text-sm ym-text-muted border-b ym-border-card">
												<span className="text-red-500">No exact matches found</span>
											</div>

											{/* Other option */}
											<div
												className="cursor-pointer select-none relative py-3 pl-4 pr-10 transition-all duration-150 ease-out hover:scale-[1.02] hover:mx-1 hover:rounded-lg ym-text-card hover:ym-bg-card-hover hover:ym-text-primary"
												onClick={createOptionClickHandler("Other")}
											>
												<span className="block truncate transition-all duration-150 font-normal">
													Other
												</span>

												{/* Hover indicator */}
												<div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-r-full" />
											</div>
										</>
									) : (
										<div className="px-4 py-6 text-sm ym-text-muted text-center">
											No options available
										</div>
									)
								) : (
									filteredOptions.map((option, index) => {
										const isSelected = option.value === value;
										return (
											<div
												key={option.value}
												className={`cursor-pointer select-none relative py-3 pl-4 pr-10 transition-all duration-150 ease-out hover:scale-[1.02] hover:mx-1 hover:rounded-lg ${
													isSelected
														? "ym-bg-amber-400 ym-text-white shadow-md mx-1 rounded-lg font-medium"
														: "ym-text-card hover:ym-bg-card-hover hover:ym-text-primary"
												}`}
												onClick={createOptionClickHandler(option.value)}
												style={{
													animationDelay: `${index * 20}ms`,
												}}
											>
												<span
													className={`block truncate transition-all duration-150 ${
														isSelected ? "font-medium pl-6" : "font-normal"
													}`}
												>
													{option.label}
												</span>

												{/* Modern checkmark with animation */}
												{isSelected && (
													<span className="absolute inset-y-0 left-0 flex items-center pl-2 animate-scale-in">
														<CheckIcon
															className="h-4 w-4 ym-text-white drop-shadow-sm"
															aria-hidden="true"
														/>
													</span>
												)}

												{/* Hover indicator */}
												{!isSelected && (
													<div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-r-full" />
												)}
											</div>
										);
									})
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Error Message */}
			{error && (
				<p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
					{error}
				</p>
			)}
		</div>
	);
};

export default SearchableSelect;
