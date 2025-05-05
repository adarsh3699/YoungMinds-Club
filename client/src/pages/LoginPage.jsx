import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			{/* Left side - Image/Brand */}
			<div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-12 flex-col justify-between">
				<div>
					<h1 className="text-4xl font-bold mb-6">YoungMinds Club</h1>
					<p className="text-xl opacity-90">Where young thinkers connect, learn, and grow together.</p>
				</div>

				<div className="space-y-8">
					<div className="flex items-start space-x-4">
						<div className="bg-white bg-opacity-20 p-2 rounded-full">
							<svg
								className="w-6 h-6"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h3 className="font-bold text-lg">Learn and Develop</h3>
							<p className="opacity-80">Access educational resources tailored for young minds</p>
						</div>
					</div>

					<div className="flex items-start space-x-4">
						<div className="bg-white bg-opacity-20 p-2 rounded-full">
							<svg
								className="w-6 h-6"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h3 className="font-bold text-lg">Connect with Peers</h3>
							<p className="opacity-80">Build friendships with like-minded young people</p>
						</div>
					</div>

					<div className="flex items-start space-x-4">
						<div className="bg-white bg-opacity-20 p-2 rounded-full">
							<svg
								className="w-6 h-6"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h3 className="font-bold text-lg">Join Activities</h3>
							<p className="opacity-80">Participate in engaging workshops and events</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Login Form */}
			<div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
				<div className="w-full max-w-md">
					<div className="text-center mb-10">
						<h2 className="text-3xl font-bold text-gray-800">Welcome back</h2>
						<p className="text-gray-600 mt-2">Log in to continue your journey with YoungMinds Club</p>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-8">
						<LoginForm />
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
