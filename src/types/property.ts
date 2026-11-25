export const CATEGORIES = ['Квартира', 'Будинок', 'Будівля'] as const;
export type PropertyCategory = (typeof CATEGORIES)[number];

export const PROPERTY_STATUSES = ['Активне', 'Перегляд', 'Заброньовано', 'Продано'] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const PRESET_IMAGES = [
    {value: 'images/apartment.jpg', label: 'Світла квартира'},
    {value: 'images/house.jpg', label: 'Будинок із садом'},
    {value: 'images/office.jpg', label: 'Офісна будівля'},
    {value: 'images/interior.jpg', label: 'Сучасний інтер’єр'},
    {value: 'images/villa.jpg', label: 'Приватний будинок'},
    {value: 'images/workspace.jpg', label: 'Робочий простір'}
] as const;

export interface Property {
    id: string;
    name: string;
    category: string;
    city: string;
    price: number;
    area: number;
    rooms: number;
    description: string;
    image: string;
    status: PropertyStatus;
    tracked: boolean;
}

export type PropertyInput = Omit<Property, 'id'>;

export interface UploadedImage {
    path: string;
    filename: string;
}

export function formatPrice(price: number): string {
    return `${new Intl.NumberFormat('uk-UA').format(price)} $`;
}

export function normalizeProperty(raw: Partial<Property> & {id: string}): Property {
    const status = PROPERTY_STATUSES.includes(raw.status as PropertyStatus)
        ? (raw.status as PropertyStatus)
        : 'Активне';
    return {
        id: String(raw.id),
        name: raw.name ?? '',
        category: raw.category ?? 'Квартира',
        city: raw.city ?? '',
        price: Number(raw.price ?? 0),
        area: Number(raw.area ?? 0),
        rooms: Number(raw.rooms ?? 1),
        description: raw.description ?? '',
        image: raw.image || 'images/apartment.jpg',
        status,
        tracked: Boolean(raw.tracked)
    };
}
