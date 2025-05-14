import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const SelectInput = ({ id, name, value, onChange, label, options, error, className = '', placeholder = 'Select an option' }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	
	// Find the selected option object
	const selectedOption = options.find(option => option.value === value) || {
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
				value: option.value
			}
		};
		onChange(event);
		setIsOpen(false);
	};
	
	return (
		<div className="mb-6" ref={dropdownRef}>
			<label htmlFor={id} className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
				{label}
			</label>
			
			<div className="relative">
				{/* Button/trigger */}
				<button
					type="button"
					id={id}
					className={`relative w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-left ${className} ${
						error ? 'border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
					}`}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className="block truncate">{selectedOption.label}</span>
					<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
						<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</span>
				</button>
				
				{/* Dropdown */}
				{isOpen && (
					<div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
						{options.map((option) => (
							<div
								key={option.value}
								className={`${
									option.value === value
										? 'text-white bg-blue-600'
										: 'text-gray-900 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
								} cursor-pointer select-none relative py-2 pl-10 pr-4`}
								onClick={() => handleSelect(option)}
							>
								<span className={`${option.value === value ? 'font-medium' : 'font-normal'} block truncate`}>
									{option.label}
								</span>
								
								{option.value === value && (
									<span className="absolute inset-y-0 left-0 flex items-center pl-3">
										<CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
									</span>
								)}
							</div>
						))}
					</div>
				)}
			</div>
			
			{error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default SelectInput;
