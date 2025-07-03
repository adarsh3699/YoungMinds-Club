import React, { useState } from "react";
import Tooltip from "./Tooltip";
import { FormInputProps } from "@/types";

const FormInput: React.FC<FormInputProps> = ({
	type = "text",
	id,
	name,
	value,
	onChange,
	onKeyDown,
	label,
	error,
	placeholder = "",
	required = false,
	icon = null,
	min,
	max,
	className = "",
	step,
	tooltip = null,
	allowNegative = true,
	showPasswordToggle = false,
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const isPasswordField = type === "password";
	const inputType = isPasswordField && showPassword ? "text" : type;
	// Handle input change with negative value prevention for number inputs
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (type === "number" && !allowNegative) {
			const value = e.target.value;
			// Allow empty string, and only positive numbers (including decimals)
			if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
				onChange(e);
			}
			// If negative or invalid, don't call onChange (blocks the input)
		} else {
			// For non-number inputs or when negative is allowed, pass through normally
			onChange(e);
		}
	};

	return (
		<div className={className}>
			{label && (
				<label htmlFor={id} className="block font-semibold ym-text-primary mb-2">
					<span className="flex items-center gap-2">
						{label}
						{required && <span className="text-brand">*</span>}
						{tooltip && <Tooltip content={tooltip} position="top" />}
					</span>
				</label>
			)}
			<div className="relative">
				{icon && (
					<div
						className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10"
						style={{ color: "#f59e0b", fontSize: "20px" }}
					>
						{icon}
					</div>
				)}
				<input
					type={inputType}
					id={id}
					name={name}
					value={value}
					onChange={handleChange}
					onKeyDown={onKeyDown}
					onWheel={(e) => {
						// Prevent number input from changing on scroll
						if (type === "number") {
							e.currentTarget.blur();
						}
					}}
					placeholder={placeholder}
					min={min}
					max={max}
					step={step}
					className={`w-full text-sm ${icon ? "pl-10" : "pl-4"} ${
						isPasswordField && showPasswordToggle ? "pr-12" : "pr-4"
					} py-3 rounded-xl transition-all duration-150 ease-out focus:outline-none backdrop-blur-sm border ${
						error ? "input-error" : "input-base"
					} ym-text-card placeholder-gray-400 font-medium`}
				/>
				{isPasswordField && showPasswordToggle && (
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
					>
						{showPassword ? (
							// Eye icon (password visible)
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7-11-7-11-7z"
								/>
								<circle
									cx="12"
									cy="12"
									r="3"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						) : (
							// Eye-slash icon (password hidden)
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7-11-7-11-7z"
								/>
								<circle
									cx="12"
									cy="12"
									r="3"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16" />
							</svg>
						)}
					</button>
				)}
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
