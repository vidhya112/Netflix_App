export const checkValidData = (
    email: string,
    password?: string,
    fullName?: string,
    isSignUp: boolean = false
): string | null => {
    const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        email.trim()
    );

    if (!email.trim()) return "Please enter an email address.";
    if (!isEmailValid) return "Please enter a valid email address.";

    if (password !== undefined) {
        if (!password) return "Please enter a password.";
        if (password.length < 6) {
            return "Password must be at least 6 characters long.";
        }
    }

    if (isSignUp && fullName !== undefined) {
        if (!fullName.trim()) return "Please enter your full name.";
        if (fullName.trim().length < 2) {
            return "Name must be at least 2 characters.";
        }
    }

    return null;
};
