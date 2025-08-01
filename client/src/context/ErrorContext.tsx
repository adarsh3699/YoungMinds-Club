import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ErrorContextType } from "@/types";

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
	children: ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useError = (): ErrorContextType => {
	const context = useContext(ErrorContext);
	if (!context) {
		throw new Error("useError must be used within an ErrorProvider");
	}
	return context;
};

export const ErrorProvider = ({ children }: ErrorProviderProps) => {
	const [error, setError] = useState<string | null>(null);

	const showError = useCallback((errorMessage: string): void => {
		setError(errorMessage);
	}, []);

	const clearError = useCallback((): void => {
		setError(null);
	}, []);

	const value: ErrorContextType = {
		error,
		showError,
		clearError,
	};

	return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};
