import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {propertiesApi} from '../api/propertiesApi';
import {PropertiesProvider} from '../context/PropertiesContext';
import PropertyFormPage from './PropertyFormPage';

describe('PropertyFormPage', () => {
    afterEach(() => vi.restoreAllMocks());

    it('validates empty fields and blocks submission', async () => {
        const user = userEvent.setup();
        vi.spyOn(propertiesApi, 'list').mockResolvedValueOnce([]);
        const createSpy = vi.spyOn(propertiesApi, 'create');

        render(
            <MemoryRouter initialEntries={['/products/new']}>
                <PropertiesProvider>
                    <Routes>
                        <Route path="/products/new" element={<PropertyFormPage />} />
                    </Routes>
                </PropertiesProvider>
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', {name: /Зберегти оголошення/i}));
        expect(screen.getByText(/Вкажіть назву від 5 до 100 символів/i)).toBeInTheDocument();
        expect(createSpy).not.toHaveBeenCalled();
    });

    it('uploads a PC image and creates a listing with returned path', async () => {
        const user = userEvent.setup();
        vi.spyOn(propertiesApi, 'list').mockResolvedValueOnce([]);
        const uploadSpy = vi.spyOn(propertiesApi, 'uploadImage').mockResolvedValueOnce({
            path: 'images/flat-999.jpg',
            filename: 'flat-999.jpg'
        });
        const createSpy = vi.spyOn(propertiesApi, 'create').mockResolvedValueOnce({
            id: 'new-1',
            name: 'Квартира біля парку',
            category: 'Квартира',
            city: 'Київ',
            price: 92000,
            area: 65,
            rooms: 2,
            description: 'Світла простора квартира поруч із парком та метро.',
            image: 'images/flat-999.jpg',
            status: 'Активне',
            tracked: true
        });

        render(
            <MemoryRouter initialEntries={['/products/new']}>
                <PropertiesProvider>
                    <Routes>
                        <Route path="/products/new" element={<PropertyFormPage />} />
                        <Route path="/products/:id" element={<div>Created page</div>} />
                    </Routes>
                </PropertiesProvider>
            </MemoryRouter>
        );

        await user.type(screen.getByLabelText(/Назва оголошення/i), 'Квартира біля парку');
        await user.type(screen.getByLabelText(/^Місто$/i), 'Київ');
        const priceInput = screen.getByLabelText(/Ціна/i);
        await user.clear(priceInput);
        await user.type(priceInput, '92000');
        const areaInput = screen.getByLabelText(/Площа/i);
        await user.clear(areaInput);
        await user.type(areaInput, '65');
        const roomsInput = screen.getByLabelText(/Кімнат/i);
        await user.clear(roomsInput);
        await user.type(roomsInput, '2');
        await user.click(screen.getByLabelText(/Додати цей об’єкт у мій трекер/i));
        await user.type(
            screen.getByLabelText(/Опис/i),
            'Світла простора квартира поруч із парком та метро.'
        );

        const file = new File(['img'], 'flat.jpg', {type: 'image/jpeg'});
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, {target: {files: [file]}});

        await user.click(screen.getByRole('button', {name: /Зберегти оголошення/i}));

        await waitFor(() => {
            expect(uploadSpy).toHaveBeenCalledWith(file);
            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Квартира біля парку',
                    image: 'images/flat-999.jpg',
                    tracked: true
                })
            );
            expect(screen.getByText('Created page')).toBeInTheDocument();
        });
    });

    it('rejects non-image files on selection', async () => {
        const listSpy = vi.spyOn(propertiesApi, 'list').mockResolvedValueOnce([]);

        render(
            <MemoryRouter initialEntries={['/products/new']}>
                <PropertiesProvider>
                    <Routes>
                        <Route path="/products/new" element={<PropertyFormPage />} />
                    </Routes>
                </PropertiesProvider>
            </MemoryRouter>
        );

        await waitFor(() => expect(listSpy).toHaveBeenCalled());

        const badFile = new File(['txt'], 'readme.txt', {type: 'text/plain'});
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, {target: {files: [badFile]}});

        expect(screen.getByRole('alert')).toHaveTextContent(/JPG, PNG, WebP/i);
    });
});
