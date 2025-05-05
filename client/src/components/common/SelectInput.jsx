import React from 'react';

const SelectInput = ({ id, name, value, onChange, label, options, error, className = '' }) => {
	return (
		<div className="mb-6">
			<label htmlFor={id} className="block text-gray-700 font-medium mb-2">
				{label}
			</label>
			<select
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white appearance-none ${className} ${
					error ? 'border-red-500 focus:ring-red-200 bg-red-50' : ''
				}`}
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
					backgroundPosition: 'right 0.5rem center',
					backgroundRepeat: 'no-repeat',
					backgroundSize: '1.5em 1.5em',
					paddingRight: '2.5rem',
				}}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default SelectInput;
