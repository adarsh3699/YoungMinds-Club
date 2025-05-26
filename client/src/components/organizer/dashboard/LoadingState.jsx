const LoadingState = () => {
	return (
		<div className="min-h-screen ym-features-bg">
			<div className="container mx-auto px-4 py-8 mt-12">
				<div className="flex justify-center items-center h-64">
					<div className="w-12 h-12 border-t-4 border-amber-400 border-solid rounded-full animate-spin mb-4"></div>
					<h2 className="text-xl font-semibold ym-text-secondary ml-4">Loading dashboard...</h2>
				</div>
			</div>
		</div>
	);
};

export default LoadingState;
