// Simple utility to get error message from server response
export const getErrorMessage = (error: unknown): string => {
	if (error && typeof error === "object" && "response" in error) {
		const e = error as { response?: { data?: { message?: string } } };
		return e.response?.data?.message || "Something went wrong. Please try again.";
	}
	return "Something went wrong. Please try again.";
};
