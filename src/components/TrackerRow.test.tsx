import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {describe, expect, it, vi} from 'vitest';
import {TrackerRow} from './TrackerRow';
import {Property} from '../types/property';

const item: Property = {
    id: '2',
    name: 'Будинок біля лісу',
    category: 'Будинок',
    city: 'Львів',
    price: 165000,
    area: 148,
    rooms: 4,
    image: 'images/house.jpg',
    status: 'Перегляд',
    tracked: true,
    description: 'Просторий будинок для спокійного життя.'
};

describe('TrackerRow', () => {
    it('allows inline editing and passes updated fields to onEdit prop', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn().mockResolvedValue(undefined);
        const onStatusChange = vi.fn();
        const onToggleTrack = vi.fn();
        const onDelete = vi.fn().mockResolvedValue(undefined);

        render(
            <MemoryRouter>
                <TrackerRow
                    property={item}
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                    onToggleTrack={onToggleTrack}
                    onDelete={onDelete}
                />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', {name: 'Швидко змінити'}));
        const nameInput = screen.getByLabelText('Назва');
        await user.clear(nameInput);
        await user.type(nameInput, 'Будинок біля лісу (оновлено)');
        await user.click(screen.getByRole('button', {name: 'Зберегти зміни'}));

        expect(onEdit).toHaveBeenCalledWith('2', {
            name: 'Будинок біля лісу (оновлено)',
            city: 'Львів',
            price: 165000
        });
    });

    it('invokes onDelete when delete button is clicked', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn().mockResolvedValue(undefined);

        render(
            <MemoryRouter>
                <TrackerRow
                    property={item}
                    onEdit={vi.fn().mockResolvedValue(undefined)}
                    onStatusChange={vi.fn()}
                    onToggleTrack={vi.fn()}
                    onDelete={onDelete}
                />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', {name: 'Видалити'}));
        expect(onDelete).toHaveBeenCalledWith('2');
    });
});
