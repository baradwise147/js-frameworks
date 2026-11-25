import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {describe, expect, it, vi} from 'vitest';
import {PropertyCard} from './PropertyCard';
import {Property} from '../types/property';

const property: Property = {
    id: '1',
    name: 'Світла квартира на Подолі',
    category: 'Квартира',
    city: 'Київ',
    price: 89000,
    area: 64,
    rooms: 2,
    image: 'images/apartment.jpg',
    status: 'Активне',
    tracked: false,
    description: 'Світлий простір із продуманим плануванням.'
};

describe('PropertyCard', () => {
    it('renders property details and calls tracking callbacks passed via props', async () => {
        const user = userEvent.setup();
        const onToggleTrack = vi.fn();
        const onStatusChange = vi.fn();

        render(
            <MemoryRouter>
                <PropertyCard
                    property={property}
                    onToggleTrack={onToggleTrack}
                    onStatusChange={onStatusChange}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('Світла квартира на Подолі')).toBeInTheDocument();
        await user.click(screen.getByRole('button', {name: 'Додати в трекер'}));
        expect(onToggleTrack).toHaveBeenCalledWith('1');

        await user.selectOptions(screen.getByLabelText('Статус для Світла квартира на Подолі'), 'Перегляд');
        expect(onStatusChange).toHaveBeenCalledWith('1', 'Перегляд');
    });
});
