import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SelectInputProps, SelectOption } from '@/types';

const SelectInput: React.FC<SelectInputProps> = ({
	id,
	name,
	value,
	onChange,
	label,
	options,
	error,
	className = '',
	placeholder = 'Select an option',
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Find the selected option object
	const selectedOption: SelectOption = options.find((option) => option.value === value) || {
		value: '',
		label: placeholder,
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setIsFocused(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Handle option selection
	const handleSelect = (option: SelectOption): void => {
		if (disabled) return;

		const event = {
			target: {
				name,
				value: option.value,
			},
		};
		onChange(event);
		setIsOpen(false);
		setIsFocused(false);
	};

	const handleToggle = (): void => {
		if (disabled) return;
		setIsOpen(!isOpen);
		setIsFocused(!isOpen);
	};

	const handleFocus = (): void => {
		setIsFocused(true);
	};

	const handleBlur = (): void => {
		setTimeout(() => setIsFocused(false), 100);
	};

	return (
		<div ref={dropdownRef}>
			{label && (
				<label htmlFor={id} className="block font-semibold ym-text-primary mb-2">
					{label}
				</label>
			)}

			<div className="relative">
				{/* Modern Button/trigger with glass effect */}
				<button
					type="button"
					id={id}
					disabled={disabled}
					className={`
						relative w-full px-4 py-3 text-left transition-all duration-150 ease-out
						rounded-xl backdrop-blur-sm shadow-sm text-[15px]
						${disabled ? 'opacity-60 cursor-not-allowed ym-bg-card' : 'cursor-pointer hover:shadow-md active:scale-[0.99]'}
						${
							error
								? 'input-error'
								: `${
										isFocused || isOpen
											? 'ym-bg-card ring-2 ring-amber-400/40 shadow-lg transform scale-[1.01]'
											: 'ym-bg-card hover:ym-bg-card-hover'
								  }`
						}
						focus:outline-none group
						${className}
					`}
					onClick={handleToggle}
					onFocus={handleFocus}
					onBlur={handleBlur}
				>
					<span
						className={`block truncate transition-colors duration-150 ${
							selectedOption.value === '' ? 'ym-text-muted italic' : 'ym-text-card'
						}`}
					>
						{selectedOption.label}
					</span>

					{/* Modern chevron with rotation animation */}
					<span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
						<ChevronUpDownIcon
							className={`h-5 w-5 transition-all duration-150 ${
								error
									? 'text-red-500'
									: isOpen
									? 'ym-text-yellow-600 rotate-180 scale-110'
									: 'ym-text-muted group-hover:ym-text-primary'
							}`}
							aria-hidden="true"
						/>
					</span>

					{/* Focus indicator */}
					{(isFocused || isOpen) && !error && (
						<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 to-yellow-400/10 pointer-events-none transition-opacity duration-150" />
					)}
				</button>

				{/* Modern Dropdown with improved animations */}
				{isOpen && (
					<div
						className="absolute z-[9999] mt-2 w-full"
						style={{
							animation: 'fadeInUpFast 150ms ease-out forwards',
						}}
					>
						<div
							className="
							ym-bg-card backdrop-blur-xl shadow-2xl max-h-64 rounded-xl 
							overflow-hidden ring-1 ring-black/5 dark:ring-white/10
							border-0
						"
							style={{
								position: 'relative',
								zIndex: 9999,
							}}
						>
							<div className="py-2 overflow-auto max-h-60">
								{options.map((option, index) => (
									<div
										key={option.value}
										className={`
											cursor-pointer select-none relative py-3 pl-4 pr-10 
											transition-all duration-150 ease-out
											hover:scale-[1.02] hover:mx-1 hover:rounded-lg
											${
												option.value === value
													? 'ym-bg-amber-400 ym-text-white shadow-md mx-1 rounded-lg font-medium'
													: 'ym-text-card hover:ym-bg-card-hover hover:ym-text-primary'
											}
											${index === 0 ? 'mt-0' : ''}
										`}
										onClick={() => handleSelect(option)}
										style={{
											animationDelay: `${index * 20}ms`,
										}}
									>
										<span
											className={`block truncate transition-all duration-150 ${
												option.value === value ? 'font-medium pl-6' : 'font-normal'
											}`}
										>
											{option.label}
										</span>

										{/* Modern checkmark with animation */}
										{option.value === value && (
											<span className="absolute inset-y-0 left-0 flex items-center pl-2 animate-scale-in">
												<CheckIcon
													className="h-4 w-4 ym-text-white drop-shadow-sm"
													aria-hidden="true"
												/>
											</span>
										)}

										{/* Hover indicator */}
										{option.value !== value && (
											<div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-r-full" />
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Modern error message */}
			{error && (
				<div className="mt-2 flex items-center space-x-2 animate-fade-in">
					<div className="w-1 h-4 bg-red-500 rounded-full"></div>
					<p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
				</div>
			)}
		</div>
	);
};

export default SelectInput;
