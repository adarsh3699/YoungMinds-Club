import React from 'react';

const FormInput = ({ type = 'text', id, name, value, onChange, label, error, placeholder = '' }) => {
	return (
		<div className="mb-4">
			<label htmlFor={id} className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
				{label}
			</label>
			<input
				type={type}
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
					error
						? 'border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20 dark:focus:ring-red-800 dark:border-red-700 dark:text-red-100'
						: 'border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-700 dark:bg-gray-700 dark:text-white'
				}`}
			/>
			{error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default FormInput;
