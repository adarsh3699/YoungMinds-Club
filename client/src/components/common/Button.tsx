import React from 'react';

interface ButtonProps {
	type?: 'button' | 'submit' | 'reset';
	children: React.ReactNode;
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	className?: string;
	disabled?: boolean;
	fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
	type = 'button', 
	children, 
	onClick, 
	className = '', 
	disabled = false, 
	fullWidth = false 
}) => {
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