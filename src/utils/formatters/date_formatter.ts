export const formatDateWords = (date:string) => {
    try {
        const today = new Date();
        const inputDate = new Date(date);

        const isToday = inputDate.toDateString() === today.toDateString();
        if (isToday) {
            return 'Today';
        }

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = inputDate.toDateString() === yesterday.toDateString();
        if (isYesterday) {
            return 'Yesterday';
        }

        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const isTomorrow = inputDate.toDateString() === tomorrow.toDateString();
        if (isTomorrow) {
            return 'Tomorrow';
        }
        return inputDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
        console.error("Error formatting date:", error);
        return date;
    }
};

export const formatDateWordsShort = (date:string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    };

export const formatDate = (date:string) => {
    try {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
        console.error("Error formatting date:", error);
        return date;
    }
};

export const formatDateTime = (date:string) => {
    try {
        return new Date(date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    catch (error) {
        console.error("Error formatting date:", error);
        return date;
    }
};


export function getWeekOfMonth(date: Date) {
    const startWeekDayIndex = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Math.ceil((date.getDate() + startWeekDayIndex) / 7);
  }
  