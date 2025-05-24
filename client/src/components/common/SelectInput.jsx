import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const SelectInput = ({
	id,
	name,
	value,
	onChange,
	label,
	options,
	error,
	className = '',
	placeholder = 'Select an option',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Find the selected option object
	const selectedOption = options.find((option) => option.value === value) || {
		value: '',
		label: placeholder,
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Handle option selection
	const handleSelect = (option) => {
		const event = {
			target: {
				name,
				value: option.value,
			},
		};
		onChange(event);
		setIsOpen(false);
	};

	return (
		<div className="mb-6" ref={dropdownRef}>
			<label htmlFor={id} className="block ym-text-primary font-semibold mb-3">
				{label}
			</label>

			<div className="relative">
				{/* Button/trigger */}
				<button
					type="button"
					id={id}
					className={`relative w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 text-left transition-all duration-200 shadow-sm hover:shadow-md ${className} ${
						error
							? 'bg-red-50 focus:ring-red-200 text-red-700 border border-red-200'
							: 'ym-bg-card ym-text-card hover:ym-bg-card-hover'
					}`}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className="block truncate font-medium">{selectedOption.label}</span>
					<span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
						<ChevronUpDownIcon
							className="h-5 w-5 ym-text-yellow-600 transition-transform duration-200"
							aria-hidden="true"
						/>
					</span>
				</button>

				{/* Dropdown */}
				{isOpen && (
					<div className="absolute z-20 mt-2 w-full ym-bg-card shadow-xl max-h-60 rounded-lg py-2 text-base overflow-auto focus:outline-none border ym-border-card">
						{options.map((option) => (
							<div
								key={option.value}
								className={`${
									option.value === value
										? 'ym-text-white ym-bg-amber-400 font-semibold'
										: 'ym-text-card hover:ym-bg-yellow-100 font-normal'
								} cursor-pointer select-none relative py-3 pl-10 pr-4 transition-all duration-150 mx-1 rounded-md`}
								onClick={() => handleSelect(option)}
							>
								<span className="block truncate">{option.label}</span>

								{option.value === value && (
									<span className="absolute inset-y-0 left-0 flex items-center pl-3">
										<CheckIcon className="h-4 w-4 ym-text-white" aria-hidden="true" />
									</span>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
		</div>
	);
};

export default SelectInput;
