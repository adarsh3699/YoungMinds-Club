import React from 'react';
import { useError } from '@/context/ErrorContext';
import ErrorAlert from './ErrorAlert';

const GlobalErrorAlert: React.FC = () => {
	const { error, clearError } = useError();

	return <ErrorAlert error={error} onClose={clearError} />;
};

export default GlobalErrorAlert; 