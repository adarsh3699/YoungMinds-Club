import { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext();

export const useError = () => {
	const context = useContext(ErrorContext);
	if (!context) {
		throw new Error('useError must be used within an ErrorProvider');
	}
	return context;
};

export const ErrorProvider = ({ children }) => {
	const [error, setError] = useState(null);

	const showError = useCallback((errorMessage) => {
		setError(errorMessage);
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const value = {
		error,
		showError,
		clearError,
	};

	return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};
