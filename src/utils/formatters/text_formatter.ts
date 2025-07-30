export const formatTextTruncate = (text:string, length:number) => {
    try {
        return text.length > length ? text.slice(0, length) + '...' : text;
    } catch (error) {
        console.error("Error formatting text:", error);
        return text;
    }
};

export const formatTextTruncateNoDecoration = (text:string, length:number) => {
    try {
        return text.length > length ? text.slice(0, length) + '' : text;
    } catch (error) {
        console.error("Error formatting text:", error);
        return text;

    }
};

export const formatTextRemoveSpaces = (text:string) => {
    try {
        return text.replace(/\s/g, '');
    } catch (error) {
        console.error("Error formatting text:", error); 
        return text;
    }
};

export const formatTextCapitalize = (text:string) => {
    try {
        return text.charAt(0).toUpperCase() + text.slice(1);
    } catch (error) {
        console.error("Error formatting text:", error);
        return text;
    }
};

export const formatTextSpacing = (text:string) => {
    try {
        if (!text) return ""; 
        return text.replace(/([a-z])([A-Z])/g, '$1 $2');
    } catch (error) {
        console.error("Error formatting text:", error);
        return text;
    }
};

export const formatTextRemoveSpecialCharacters = (text:string) => {
    try {
        return text.replace(/[#,@\-_ ]/g, '');
    } catch (error) {
        console.error("Error formatting text:", error);
        return text;
    }
};
