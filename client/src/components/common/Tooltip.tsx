import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { TooltipProps } from '@/types';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
	const [isVisible, setIsVisible] = useState<boolean>(false);

	// Optimized positioning with CSS classes
	const positionClasses: Record<TooltipPosition, string> = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2',
	};

	// Arrow styles using border triangles
	const arrowStyles: Record<TooltipPosition, React.CSSProperties> = {
		top: {
			top: '100%',
			left: '50%',
			transform: 'translateX(-50%)',
			borderLeft: '6px solid transparent',
			borderRight: '6px solid transparent',
			borderTop: '6px solid #334155',
		},
		bottom: {
			bottom: '100%',
			left: '50%',
			transform: 'translateX(-50%)',
			borderLeft: '6px solid transparent',
			borderRight: '6px solid transparent',
			borderBottom: '6px solid #1e293b',
		},
		left: {
			left: '100%',
			top: '50%',
			transform: 'translateY(-50%)',
			borderTop: '6px solid transparent',
			borderBottom: '6px solid transparent',
			borderLeft: '6px solid #334155',
		},
		right: {
			right: '100%',
			top: '50%',
			transform: 'translateY(-50%)',
			borderTop: '6px solid transparent',
			borderBottom: '6px solid transparent',
			borderRight: '6px solid #1e293b',
		},
	};

	return (
		<div className="relative inline-block">
			<div
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
				className="cursor-help"
			>
				{children || (
					<InformationCircleIcon className="h-4 w-4 text-slate-400 hover:text-amber-500 transition-all duration-200 hover:scale-110" />
				)}
			</div>

			{isVisible && (
				<div
					className={`absolute z-50 px-4 py-3 text-sm text-white rounded-xl shadow-2xl border border-slate-700 backdrop-blur-sm max-w-[250px] min-w-[150px] whitespace-normal break-words leading-relaxed ${positionClasses[position]}`}
					style={{
						background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
						boxShadow:
							'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)',
					}}
				>
					{content}
					<div className="absolute" style={arrowStyles[position]} />
				</div>
			)}
		</div>
	);
};

export default Tooltip; 