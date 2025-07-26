export const formatCurrency = (currency:string) => {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currency);
    } catch (error) {
        console.error("Error formatting currency:", error);
        return currency;
    }
};