import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
	return (
		<div className="auth-page">
			<div className="container mx-auto py-10 px-4">
				<div className="max-w-md mx-auto">
					<h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Join YoungMinds Club</h1>
					<div className="bg-white shadow-lg rounded-lg overflow-hidden">
						<RegisterForm />
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
