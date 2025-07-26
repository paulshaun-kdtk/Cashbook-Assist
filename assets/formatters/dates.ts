export const formatDateWords = (date) => {
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
        return date;
    }
};

export const formatDate = (date) => {
    try {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
        return date;
    }
};

export const formatDateShort = (date) => {
    try {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (error) {
        return date;
    }
}

export const formatDateShortWords = (date) => {
    try {
        const inputDate = new Date(date);
        const today = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const differenceInDays = Math.round((today.getTime() - inputDate.getTime()) / oneDay);

        if (differenceInDays === 0) {
            return 'Today';
        } else if (differenceInDays === 1) {
            return 'Yesterday';
        } else if (differenceInDays < 7) {
            return `${differenceInDays} days ago`;
        } else if (differenceInDays < 30) {
            return `Last week`;
        } else if (differenceInDays < 365) {
            const monthsAgo = Math.floor(differenceInDays / 30);
            return monthsAgo === 1 ? 'Last month' : `${monthsAgo} months ago`;
        } else {
            const yearsAgo = Math.floor(differenceInDays / 365);
            return yearsAgo === 1 ? 'Last year' : `${yearsAgo} years ago`;
        }
        
    } catch (error) {
        console.error(error);
        return date;
    }
}

export const formatDateTime = (date) => {
    try {
        return new Date(date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    catch (error) {
        return date;
    }
};

export const formatTextTruncate = (text, length) => {
    try {
        return text.length > length ? text.slice(0, length) + '...' : text;
    } catch (error) {
        return text;
    }
};