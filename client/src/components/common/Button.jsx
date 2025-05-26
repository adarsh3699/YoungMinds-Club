import React from 'react';

const Button = ({ type = 'button', children, onClick, className = '', disabled = false, fullWidth = false }) => {
	const baseClasses =
		'btn-primary py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 focus:outline-none focus-ring font-medium';
	const widthClass = fullWidth ? 'w-full' : '';
	const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`${baseClasses} ${widthClass} ${disabledClass} ${className}`}
		>
			{children}
		</button>
	);
};

export default Button;
