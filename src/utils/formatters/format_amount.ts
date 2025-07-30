export const formatAmountRound = (amount: number, decimalPlaces: number = 2) => {
    try {
        if (isNaN(amount)) return amount;
        return amount.toFixed(decimalPlaces);
    } catch (error) {
        console.error("Error formatting amount:", error);
        return amount;
    }
}

export const formatAmount = (amount: number, decimalPlaces: number = 2) => {
    try {
        if (isNaN(amount)) return amount;
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        });
    } catch (error) {
        console.error("Error formatting amount:", error);
        return amount;
    }
}