import React from 'react';
import Tooltip from './Tooltip';

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
	tooltip = null,
	...additionalProps
}) => {
	return (
		<div className={className}>
			{label && (
				<label htmlFor={id} className="block font-semibold ym-text-primary mb-2">
					<span className="flex items-center">
						{label}
						{required && <span className="text-brand ml-1">*</span>}
						{tooltip && (
							<span className="ml-2">
								<Tooltip content={tooltip} position="top" />
							</span>
						)}
					</span>
				</label>
			)}
			<div className="relative">
				{icon && (
					<div
						className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10"
						style={{ color: '#f59e0b', fontSize: '20px' }}
					>
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
						error ? 'input-error' : 'input-base'
					} ym-text-card placeholder-gray-400 font-medium`}
					{...additionalProps}
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
