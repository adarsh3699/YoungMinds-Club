import React from 'react';

const FormInput = ({ type = 'text', id, name, value, onChange, label, error, placeholder = '' }) => {
	return (
		<div className="mb-4">
			<label htmlFor={id} className="block text-gray-700 font-medium mb-2">
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
						? 'border-red-500 focus:ring-red-200 bg-red-50'
						: 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
				}`}
			/>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default FormInput;
