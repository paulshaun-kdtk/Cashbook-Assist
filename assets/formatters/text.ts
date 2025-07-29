export const formatTextTruncate = (text, length) => {
    try {
        return text.length > length ? text.slice(0, length) + '...' : text;
    } catch (error) {
        return text;
    }
};

export const formatTextTruncateNoDecoration = (text, length) => {
    try {
        return text.length > length ? text.slice(0, length) + '' : text;
    } catch (error) {
        return text;
    }
};

export const formatTextRemoveSpaces = (text) => {
    try {
        return text.replace(/\s/g, '');
    } catch (error) {
        return text;
    }
};

export const formatTextCapitalize = (text) => {
    try {
        return text.charAt(0).toUpperCase() + text.slice(1);
    } catch (error) {
        return text;
    }
};

export const formatTextSpacing = (text) => {
    try {
        if (!text) return ""; 
        return text.replace(/([a-z])([A-Z])/g, '$1 $2');
    } catch (error) {
        return text;
    }
};

export const formatTextRemoveSpecialCharacters = (text) => {
    try {
        return text.replace(/[#,@\-_ ]/g, '');
    } catch (error) {
        return text;
    }
};