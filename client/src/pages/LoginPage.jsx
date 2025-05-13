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
						<div className="bg-white bg-opacity-20 p-2 rounded-full flex items-center justify-center">
							<span className="text-lg font-bold">🎓</span>
						</div>
						<div>
							<h3 className="font-bold text-lg">Learn and Develop</h3>
							<p className="opacity-80">Access educational resources tailored for young minds</p>
						</div>
					</div>

					<div className="flex items-start space-x-4">
						<div className="bg-white bg-opacity-20 p-2 rounded-full flex items-center justify-center">
							<span className="text-lg font-bold">👥</span>
						</div>
						<div>
							<h3 className="font-bold text-lg">Connect with Peers</h3>
							<p className="opacity-80">Build friendships with like-minded young people</p>
						</div>
					</div>

					<div className="flex items-start space-x-4">
						<div className="bg-white bg-opacity-20 p-2 rounded-full flex items-center justify-center">
							<span className="text-lg font-bold">📅</span>
						</div>
						<div>
							<h3 className="font-bold text-lg">Join Activities</h3>
							<p className="opacity-80">Participate in engaging workshops and events</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Login Form */}
			<div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
				<div className="w-full max-w-md">
					<div className="text-center mb-10">
						<h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back</h2>
						<p className="text-gray-600 dark:text-gray-300 mt-2">Log in to continue your journey with YoungMinds Club</p>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
						<LoginForm />
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
