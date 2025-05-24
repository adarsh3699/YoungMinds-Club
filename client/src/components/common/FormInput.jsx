import React from 'react';

const FormInput = ({ type = 'text', id, name, value, onChange, label, error, placeholder = '' }) => {
	return (
		<div className="mb-4">
			<label htmlFor={id} className="block ym-text-primary font-medium mb-2">
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
						? 'border-red-500 focus:ring-red-200 ym-bg-card ym-text-card'
						: 'ym-border-card focus:ring-amber-200 focus:border-amber-500 ym-bg-card ym-text-card'
				}`}
			/>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default FormInput;
