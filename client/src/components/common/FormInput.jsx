import React from 'react';

const FormInput = ({
	type = 'text',
	id,
	name,
	value,
	onChange,
	label,
	error,
	placeholder = '',
	required = false,
	icon = null,
	min,
	max,
	className = '',
	step,
}) => {
	return (
		<div className={className}>
			<label htmlFor={id} className="block font-medium ym-text-primary mb-2">
				{label}
				{required && <span className="ym-text-yellow-600 ml-1">*</span>}
			</label>
			<div className="relative">
				{icon && (
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ym-text-yellow-600">
						{icon}
					</div>
				)}
				<input
					type={type}
					id={id}
					name={name}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					min={min}
					max={max}
					step={step}
					className={`w-full ${
						icon ? 'pl-10' : 'pl-4'
					} pr-4 py-3 rounded-xl transition-all duration-150 ease-out focus:outline-none backdrop-blur-sm border ${
						error
							? 'bg-red-50/80 dark:bg-red-900/20 text-red-700 dark:text-red-300 ring-2 ring-red-500/30 border-red-300'
							: 'ym-bg-card border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-300 focus:shadow-lg'
					} ym-text-card placeholder-gray-400 font-medium`}
				/>
			</div>
			{error && (
				<div className="mt-2 flex items-center space-x-2 animate-fade-in">
					<div className="w-1 h-4 bg-red-500 rounded-full"></div>
					<p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
				</div>
			)}
		</div>
	);
};

export default FormInput;
