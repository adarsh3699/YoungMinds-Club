import React, { useRef, useEffect, useCallback } from "react";
import { TextareaFieldProps } from "@/types";

const TextareaField: React.FC<TextareaFieldProps> = ({
	id,
	name,
	value,
	onChange,
	label,
	error,
	placeholder = "",
	required = false,
	rows = 3,
	maxLength,
	className = "",
	expandable = true,
	minRows = 3,
	maxRows = 10,
	hideLabel = false,
	hideCharCountInLabel = false,
}) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Memoized auto-resize function for better performance
	const autoResize = useCallback((): void => {
		if (!expandable || !textareaRef.current) return;

		const textarea = textareaRef.current;
		const scrollTop = textarea.scrollTop;

		// Reset and measure
		textarea.style.height = "auto";
		textarea.style.overflowY = "hidden";

		const { scrollHeight, style } = textarea;
		const computedStyle = window.getComputedStyle(textarea);

		// Extract dimensions with fallbacks
		const lineHeight = parseInt(computedStyle.lineHeight) || 20;
		const paddingY = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom) || 0;
		const borderY = parseInt(computedStyle.borderTopWidth) + parseInt(computedStyle.borderBottomWidth) || 0;

		// Calculate optimal dimensions
		const contentHeight = scrollHeight - paddingY;
		const lines = Math.ceil(contentHeight / lineHeight);
		const targetRows = Math.max(minRows, Math.min(maxRows, lines));
		const targetHeight = targetRows * lineHeight + paddingY + borderY;

		// Apply changes
		style.height = `${targetHeight}px`;
		style.overflowY = lines > maxRows ? "auto" : "hidden";

		// Restore scroll position if needed
		if (scrollTop > 0 && lines > maxRows) {
			textarea.scrollTop = scrollTop;
		}
	}, [expandable, minRows, maxRows]);

	// Optimized resize trigger
	const triggerResize = useCallback((): void => {
		if (expandable) {
			requestAnimationFrame(autoResize);
		}
	}, [autoResize, expandable]);

	// Handle input changes
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>): void => {
			onChange(e);
			triggerResize();
		},
		[onChange, triggerResize]
	);

	// Handle real-time input for responsive resizing
	const handleInput = useCallback((): void => {
		if (expandable) {
			autoResize();
		}
	}, [autoResize, expandable]);

	// Initial setup and value change effects
	useEffect(() => {
		if (expandable) {
			const timer = setTimeout(autoResize, 0);
			return () => clearTimeout(timer);
		}
		return;
	}, [autoResize, expandable]);

	useEffect(() => {
		triggerResize();
	}, [value, triggerResize]);

	return (
		<div className={className}>
			{!hideLabel && label && (
				<label htmlFor={id} className="block text-sm font-semibold ym-text-primary mb-2">
					{label}
					{required && <span className="text-brand ml-1">*</span>}
					{maxLength && !hideCharCountInLabel && (
						<span className="ym-text-muted ml-2 font-normal">(Max {maxLength} chars)</span>
					)}
				</label>
			)}
			<textarea
				ref={textareaRef}
				id={id}
				name={name}
				value={value}
				onChange={handleChange}
				onInput={handleInput}
				rows={expandable ? minRows : rows}
				maxLength={maxLength}
				className={`w-full px-4 py-3 text-sm rounded-xl transition-all duration-150 ease-out focus:outline-none backdrop-blur-sm resize-none border ${
					error
						? "input-error"
						: "ym-bg-card border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-300 focus:shadow-lg"
				} ym-text-card placeholder-gray-400 font-medium`}
				placeholder={placeholder}
				style={
					expandable
						? {
								minHeight: `${minRows * 1.5}rem`,
								overflowY: "hidden",
								resize: "none",
						  }
						: {}
				}
			/>
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
									? "bg-red-400"
									: value.length > maxLength * 0.7
									? "ym-bg-orange-400"
									: "gradient-bg"
							}`}
							style={{ width: `${Math.min(100, (value.length / maxLength) * 100)}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default TextareaField;
