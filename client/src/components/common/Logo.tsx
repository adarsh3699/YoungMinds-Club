import React from 'react';
import { LogoProps } from '@/types';

const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
	return (
		<div className={`flex items-center space-x-2 ${className}`}>
			<div className="relative">
				<div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
					<span className="text-white font-bold text-lg">Y</span>
				</div>
				<div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
			</div>
			<span className="font-bold text-xl yellow-gradient-text">YoungMinds</span>
		</div>
	);
};

export default Logo; 