import React, { useState, useRef, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DateTimePicker.css';
import { CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { DateTimePickerProps, TimeOption, CustomHeaderProps } from '@/types';

const DateTimePicker: React.FC<DateTimePickerProps> = ({
	id,
	name,
	value,
	onChange,
	label,
	error,
	required = false,
	placeholder = 'Select date and time',
	minDate,
	maxDate,
	className = '',
	showTimeSelect = true,
	timeIntervals = 15,
}) => {
	// Convert string value to Date object if needed
	const dateValue: Date | null = value ? (typeof value === 'string' ? new Date(value) : value) : null;
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedTime, setSelectedTime] = useState<string>(
		dateValue
			? `${dateValue.getHours().toString().padStart(2, '0')}:${dateValue
					.getMinutes()
					.toString()
					.padStart(2, '0')}`
			: ''
	);
	const [customTime, setCustomTime] = useState<string>('');
	const pickerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Generate time options in AM/PM format
	const timeOptions: TimeOption[] = useMemo(() => {
		const times: TimeOption[] = [];
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += timeIntervals) {
				const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
				const ampm = hour < 12 ? 'AM' : 'PM';
				const timeString = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
				const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
				times.push({ display: timeString, value: timeValue });
			}
		}
		return times;
	}, [timeIntervals]);

	// Handle clicking outside to close picker
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(event.target as Node) &&
				!inputRef.current?.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
		return;
	}, [isOpen]);

	const updateDateTime = (date: Date, time?: string): void => {
		if (!date) return;

		if (time) {
			const [hours, minutes] = time.split(':');
			date.setHours(parseInt(hours), parseInt(minutes));
		}

		onChange({
			target: {
				name,
				value: date.toISOString(),
			},
		});
	};

	const handleDateChange = (date: Date | null): void => {
		if (date) {
			updateDateTime(date, selectedTime);
		}
	};

	const handleTimeSelect = (timeValue: string): void => {
		setSelectedTime(timeValue);
		setCustomTime('');

		if (dateValue) {
			const newDate = new Date(dateValue);
			updateDateTime(newDate, timeValue);
		}
	};

	const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const time = e.target.value;
		setCustomTime(time);

		if (time && time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
			setSelectedTime(time);

			if (dateValue) {
				const newDate = new Date(dateValue);
				updateDateTime(newDate, time);
			}
		}
	};

	// Custom header component with navigation
	const CustomHeader = ({ 
		date, 
		decreaseMonth, 
		increaseMonth, 
		prevMonthButtonDisabled, 
		nextMonthButtonDisabled 
	}: CustomHeaderProps): React.JSX.Element => (
		<div className="react-datepicker__header">
			<button
				type="button"
				onClick={decreaseMonth}
				disabled={prevMonthButtonDisabled}
				className="react-datepicker__navigation react-datepicker__navigation--previous"
				aria-label="Previous month"
			>
				<ChevronLeftIcon className="h-4 w-4 text-white" />
			</button>

			<div className="react-datepicker__current-month">
				{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
			</div>

			<button
				type="button"
				onClick={increaseMonth}
				disabled={nextMonthButtonDisabled}
				className="react-datepicker__navigation react-datepicker__navigation--next"
				aria-label="Next month"
			>
				<ChevronRightIcon className="h-4 w-4 text-white" />
			</button>
		</div>
	);

	const handleInputClick = (): void => {
		setIsOpen(!isOpen);
	};

	return (
		<div className={className}>
			<label htmlFor={id} className="block font-semibold ym-text-primary mb-2">
				{label}
				{required && <span className="text-brand ml-1">*</span>}
			</label>

			<div className="relative">
				<CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand pointer-events-none z-10" />
				<input
					ref={inputRef}
					id={id}
					type="text"
					value={dateValue ? dateValue.toLocaleString() : ''}
					placeholder={placeholder}
					readOnly
					onClick={handleInputClick}
					className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-150 ease-out focus:outline-none backdrop-blur-sm border cursor-pointer ${
						error
							? 'input-error'
							: 'ym-bg-card border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-300 focus:shadow-lg'
					} ym-text-card placeholder-gray-400 font-medium`}
				/>

				{isOpen && (
					<div ref={pickerRef} className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-xl">
						<div className="ym-datepicker-calendar">
							<DatePicker
								selected={dateValue}
								onChange={handleDateChange}
								minDate={minDate}
								maxDate={maxDate}
								inline
								showTimeSelect={false}
								calendarClassName="ym-datepicker-calendar-inline"
								renderCustomHeader={CustomHeader}
							/>

							{showTimeSelect && (
								<div className="ym-time-selection-container">
									<div className="ym-time-header-row">
										<div className="ym-time-header">
											<ClockIcon className="h-4 w-4" />
											<span>Select Time</span>
										</div>

										<div className="ym-custom-time-inline">
											<input
												type="time"
												value={customTime}
												onChange={handleCustomTimeChange}
												className="ym-custom-time-input-inline"
												placeholder="HH:MM"
											/>
										</div>
									</div>

									<div className="ym-time-scroll-container">
										<div className="ym-time-options">
											{timeOptions.map((timeObj) => (
												<button
													key={timeObj.value}
													type="button"
													onClick={() => handleTimeSelect(timeObj.value)}
													className={`ym-time-option ${
														selectedTime === timeObj.value ? 'selected' : ''
													}`}
												>
													{timeObj.display}
												</button>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
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

export default DateTimePicker; 