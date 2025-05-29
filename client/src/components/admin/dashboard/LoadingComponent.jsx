const LoadingComponent = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-center items-center h-64">
					<div className="relative">
						<div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
						<div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-secondary rounded-full animate-ping"></div>
					</div>
					<div className="ml-6">
						<h2 className="text-2xl font-bold text-primary animate-pulse">Loading Dashboard</h2>
						<p className="text-muted-foreground mt-2">Please wait while we fetch the latest data...</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoadingComponent;
