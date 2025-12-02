/**
 * Размеры шрифтов для настройки в CRM
 */

export const FONT_SIZES = {
    xs: {
        text: 'text-[11px]',
        value: 11,
        name: 'XS',
        description: 'Очень мелкий'
    },
    s: {
        text: 'text-xs',
        value: 12,
        name: 'S',
        description: 'Мелкий'
    },
    m: {
        text: 'text-sm',
        value: 14,
        name: 'M',
        description: 'Средний (по умолчанию)'
    },
    l: {
        text: 'text-base',
        value: 16,
        name: 'L',
        description: 'Крупный'
    },
    xl: {
        text: 'text-lg',
        value: 18,
        name: 'XL',
        description: 'Очень крупный'
    }
};

/**
 * Размеры эмодзи (множитель от базового размера)
 */
export const EMOJI_SIZES = {
    xs: { multiplier: 1.0, name: 'XS' },
    s: { multiplier: 1.2, name: 'S' },
    m: { multiplier: 1.5, name: 'M' },  // default
    l: { multiplier: 1.8, name: 'L' },
    xl: { multiplier: 2.0, name: 'XL' }
};

/**
 * Получить Tailwind класс по размеру
 */
export function getFontSizeClass(size) {
    return FONT_SIZES[size]?.text || FONT_SIZES.m.text;
}

/**
 * Получить значение в пикселях
 */
export function getFontSizeValue(size) {
    return FONT_SIZES[size]?.value || FONT_SIZES.m.value;
}

/**
 * Получить множитель для эмодзи
 */
export function getEmojiMultiplier(size) {
    return EMOJI_SIZES[size]?.multiplier || EMOJI_SIZES.m.multiplier;
}