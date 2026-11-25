import {afterEach, describe, expect, it, vi} from 'vitest';
import {apiClient, propertiesApi} from './propertiesApi';
import {Property, PropertyInput} from '../types/property';

const draft: PropertyInput = {
    name: 'Квартира біля парку',
    category: 'Квартира',
    city: 'Київ',
    price: 90000,
    area: 60,
    rooms: 2,
    description: 'Світла квартира з великим балконом і видом на парк.',
    image: 'images/apartment.jpg',
    status: 'Активне',
    tracked: true
};

const sample: Property = {...draft, id: '1'};

describe('propertiesApi (Axios CRUD & upload)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('fetches and normalizes the list of properties', async () => {
        const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({data: [sample]});
        const list = await propertiesApi.list();
        expect(spy).toHaveBeenCalledWith('/products');
        expect(list).toEqual([sample]);
    });

    it('creates a property via POST', async () => {
        const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({data: {...draft, id: 'new'}});
        const created = await propertiesApi.create(draft);
        expect(spy).toHaveBeenCalledWith('/products', draft);
        expect(created.id).toBe('new');
    });

    it('updates a property via PUT', async () => {
        const updated = {...draft, price: 95000};
        const spy = vi.spyOn(apiClient, 'put').mockResolvedValueOnce({data: {...updated, id: '1'}});
        const res = await propertiesApi.update('1', updated);
        expect(spy).toHaveBeenCalledWith('/products/1', updated);
        expect(res.price).toBe(95000);
    });

    it('patches tracking fields via PATCH', async () => {
        const spy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
            data: {...sample, status: 'Заброньовано'}
        });
        const res = await propertiesApi.patch('1', {status: 'Заброньовано'});
        expect(spy).toHaveBeenCalledWith('/products/1', {status: 'Заброньовано'});
        expect(res.status).toBe('Заброньовано');
    });

    it('deletes a property via DELETE', async () => {
        const spy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({data: {}});
        await propertiesApi.remove('1');
        expect(spy).toHaveBeenCalledWith('/products/1');
    });

    it('uploads an image file via POST /upload with file headers', async () => {
        const file = new File(['png-data'], 'my flat.png', {type: 'image/png'});
        const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
            data: {path: 'images/my-flat-123.png', filename: 'my-flat-123.png'}
        });
        const res = await propertiesApi.uploadImage(file);
        expect(spy).toHaveBeenCalledWith('/upload', file, {
            headers: {
                'Content-Type': 'image/png',
                'X-File-Name': 'my%20flat.png'
            }
        });
        expect(res.path).toBe('images/my-flat-123.png');
    });
});
