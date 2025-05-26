const ErrorState = ({ error }) => {
	return (
		<div className="min-h-screen ym-features-bg">
			<div className="container mx-auto px-4 py-8 mt-12">
				<div className="ym-bg-card border ym-border-card text-red-700 px-4 py-3 rounded-lg relative animate-fade-in">
					<strong className="font-bold">Error!</strong>
					<span className="block sm:inline"> {error}</span>
				</div>
			</div>
		</div>
	);
};

export default ErrorState;
