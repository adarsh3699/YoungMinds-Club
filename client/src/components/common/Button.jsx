import React from 'react';

const Button = ({ type = 'button', children, onClick, className = '', disabled = false, fullWidth = false }) => {
	const baseClasses =
		'bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
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
