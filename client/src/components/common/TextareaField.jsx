import React from 'react';

const TextareaField = ({
	id,
	name,
	value,
	onChange,
	label,
	error,
	placeholder = '',
	required = false,
	rows = 3,
	maxLength,
	className = '',
}) => {
	return (
		<div className={className}>
			<label htmlFor={id} className="block text-sm font-semibold ym-text-primary mb-2">
				{label}
				{required && <span className="text-brand ml-1">*</span>}
				{maxLength && <span className="ym-text-muted ml-2 font-normal">(Max {maxLength} chars)</span>}
			</label>
			<textarea
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				rows={rows}
				maxLength={maxLength}
				className={`w-full px-4 py-3 rounded-xl transition-all duration-150 ease-out focus:outline-none backdrop-blur-sm resize-none border ${
					error
						? 'input-error'
						: 'ym-bg-card border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-300 focus:shadow-lg'
				} ym-text-card placeholder-gray-400 font-medium`}
				placeholder={placeholder}
			></textarea>
			{error && (
				<div className="mt-2 flex items-center space-x-2 animate-fade-in">
					<div className="w-1 h-4 bg-red-500 rounded-full"></div>
					<p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
				</div>
			)}
			{maxLength && (
				<div className="flex justify-between items-center mt-2">
					<p className="text-xs ym-text-muted">
						{value.length}/{maxLength} characters
					</p>
					<div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
						<div
							className={`h-full transition-all duration-300 ${
								value.length > maxLength * 0.9
									? 'bg-red-400'
									: value.length > maxLength * 0.7
									? 'ym-bg-orange-400'
									: 'gradient-bg'
							}`}
							style={{ width: `${Math.min(100, (value.length / maxLength) * 100)}%` }}
						></div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TextareaField;
