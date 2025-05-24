import { useMemo } from 'react';

const XPProgressBar = ({ xp }) => {
	// Define XP thresholds for each level
	const levels = useMemo(
		() => [
			{ name: 'Newbie', min: 0, max: 49 },
			{ name: 'Regular', min: 50, max: 149 },
			{ name: 'Champ', min: 150, max: 299 },
			{ name: 'Veteran', min: 300, max: 499 },
			{ name: 'Master', min: 500, max: Infinity },
		],
		[]
	);

	// Find current level based on XP
	const currentLevel = useMemo(() => {
		return levels.find((level) => xp >= level.min && xp <= level.max);
	}, [xp, levels]);

	// Find next level
	const nextLevel = useMemo(() => {
		const currentLevelIndex = levels.findIndex((level) => level.name === currentLevel.name);
		return currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
	}, [currentLevel, levels]);

	// Calculate progress percentage
	const progressPercentage = useMemo(() => {
		if (!nextLevel) return 100; // Already at max level

		const totalRange = nextLevel.min - currentLevel.min;
		const currentProgress = xp - currentLevel.min;
		return Math.min(Math.floor((currentProgress / totalRange) * 100), 100);
	}, [xp, currentLevel, nextLevel]);

	// XP needed for next level
	const xpForNextLevel = useMemo(() => {
		return nextLevel ? nextLevel.min - xp : 0;
	}, [xp, nextLevel]);

	return (
		<div className="w-full">
			<div className="flex justify-between mb-1">
				<div>
					<span className="text-sm font-medium ym-text-primary">XP: {xp}</span>
				</div>
				{nextLevel && (
					<div>
						<span className="text-sm font-medium ym-text-muted">
							{xpForNextLevel} XP to reach {nextLevel.name}
						</span>
					</div>
				)}
			</div>

			<div className="w-full ym-bg-yellow-100 rounded-full h-4 relative mb-1 border ym-border-card">
				<div
					className="gradient-bg h-4 rounded-full transition-all duration-700 ease-out"
					style={{ width: `${progressPercentage}%` }}
				></div>

				{/* Level markers */}
				{levels.slice(1, -1).map((level, index) => (
					<div
						key={level.name}
						className="absolute top-0 bottom-0 border-l ym-border-card"
						style={{
							left: `${(level.min / levels[levels.length - 1].min) * 100}%`,
							opacity: xp >= level.min ? 0.5 : 0.2,
						}}
					></div>
				))}
			</div>

			{/* Level labels */}
			<div className="flex justify-between text-xs ym-text-muted mt-1">
				{levels.map((level, index) => {
					// Don't show Master min, only show up to Veteran
					if (index === levels.length - 1) return null;

					return (
						<div
							key={level.name}
							className={`${
								index === 0 ? 'text-left' : index === levels.length - 2 ? 'text-right' : 'text-center'
							} ${currentLevel.name === level.name ? 'font-semibold ym-text-yellow-700' : ''}`}
							style={{
								minWidth: '45px',
								opacity: xp >= level.min ? 1 : 0.5,
							}}
						>
							{level.min}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default XPProgressBar;
