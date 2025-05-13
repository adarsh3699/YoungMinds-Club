import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const SelectInput = ({ id, name, value, onChange, label, options, error, className = '' }) => {
	// Find the selected option object
	const selectedOption = options.find(option => option.value === value) || options[0];
	
	// Handler to convert HeadlessUI's selection to the expected onChange format
	const handleChange = (selectedOption) => {
		const event = {
			target: {
				name,
				value: selectedOption.value
			}
		};
		onChange(event);
	};
	
	return (
		<div className="mb-6">
			<Listbox value={selectedOption} onChange={handleChange}>
				{({ open }) => (
					<>
						<Listbox.Label htmlFor={id} className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
							{label}
						</Listbox.Label>
						<div className="relative">
							<Listbox.Button
								className={`relative w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-left ${className} ${
									error ? 'border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
								}`}
							>
								<span className="block truncate">{selectedOption.label}</span>
								<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
									<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
								</span>
							</Listbox.Button>
							<Transition
								show={open}
								as={Fragment}
								leave="transition ease-in duration-100"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
									{options.map((option) => (
										<Listbox.Option
											key={option.value}
											value={option}
											className={({ active }) =>
												`${active ? 'text-white bg-blue-600' : 'text-gray-900 dark:text-gray-300'} 
												cursor-default select-none relative py-2 pl-10 pr-4`
											}
										>
											{({ selected, active }) => (
												<>
													<span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>
														{option.label}
													</span>
													{selected ? (
														<span
															className={`${active ? 'text-white' : 'text-blue-600'} absolute inset-y-0 left-0 flex items-center pl-3`}
														>
															<CheckIcon className="h-5 w-5" aria-hidden="true" />
														</span>
													) : null}
												</>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Transition>
						</div>
					</>
				)}
			</Listbox>
			{error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default SelectInput;
