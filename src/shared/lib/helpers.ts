export const capitalizeFirstWord = (text: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export const capitalizeWords = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const formatKeyToLabel = (key: string): string => {
    // 1. Reemplazar guiones bajos por espacios
    const spacedKey = key.replace(/_/g, ' ');
    // 2. Convertir la primera letra de cada palabra a mayúscula
    return spacedKey.replace(/\b\w/g, (char) => char.toUpperCase());
};
