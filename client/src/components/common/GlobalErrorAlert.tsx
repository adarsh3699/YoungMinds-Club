import React from 'react';
import { useError } from '@/context/ErrorContext';
import MsgAlert from './msgAlert';

const GlobalErrorAlert: React.FC = () => {
	const { error, clearError } = useError();

	return <MsgAlert message={error} type="error" onClose={clearError} />;
};

export default GlobalErrorAlert; 