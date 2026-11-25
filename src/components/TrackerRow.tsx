import {FormEvent, useState} from 'react';
import {Link} from 'react-router-dom';
import {formatPrice, Property, PropertyInput, PROPERTY_STATUSES, PropertyStatus} from '../types/property';

interface TrackerRowProps {
    property: Property;
    onEdit: (id: string, changes: Partial<PropertyInput>) => Promise<void>;
    onStatusChange: (id: string, status: PropertyStatus) => void;
    onToggleTrack: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
}

export function TrackerRow({property, onEdit, onStatusChange, onToggleTrack, onDelete}: TrackerRowProps) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(property.name);
    const [city, setCity] = useState(property.city);
    const [price, setPrice] = useState(String(property.price));
    const [rowError, setRowError] = useState('');
    const [busy, setBusy] = useState(false);

    const startEdit = () => {
        setName(property.name);
        setCity(property.city);
        setPrice(String(property.price));
        setRowError('');
        setEditing(true);
    };

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedName = name.trim();
        const trimmedCity = city.trim();
        const numericPrice = Number(price);

        if (trimmedName.length < 5 || trimmedName.length > 100) {
            setRowError('Назва має містити від 5 до 100 символів.');
            return;
        }
        if (trimmedCity.length < 2) {
            setRowError('Вкажіть коректне місто.');
            return;
        }
        if (!Number.isFinite(numericPrice) || numericPrice < 1) {
            setRowError('Ціна має бути більше 0.');
            return;
        }

        setBusy(true);
        setRowError('');
        try {
            await onEdit(property.id, {name: trimmedName, city: trimmedCity, price: numericPrice});
            setEditing(false);
        } catch (err) {
            setRowError(err instanceof Error ? err.message : 'Не вдалося оновити запис.');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        setRowError('');
        try {
            await onDelete(property.id);
        } catch (err) {
            setRowError(err instanceof Error ? err.message : 'Не вдалося видалити запис.');
            setBusy(false);
        }
    };

    return (
        <article className="tracker-row">
            <img
                className="tracker-thumb"
                src={`/${property.image.replace(/^\/+/, '')}`}
                alt={property.name}
                width={120}
                height={84}
            />
            <div className="tracker-row-body">
                {!editing ? (
                    <>
                        <div className="tracker-row-head">
                            <div>
                                <p className="muted location">
                                    <span>
                                        {property.category} · {property.city}
                                    </span>
                                    <span>• {property.area} м²</span>
                                </p>
                                <h3>
                                    <Link to={`/products/${property.id}`}>{property.name}</Link>
                                </h3>
                            </div>
                            <strong className="tracker-price">{formatPrice(property.price)}</strong>
                        </div>
                        <div className="tracker-row-actions">
                            <label className="inline-status">
                                Статус:
                                <select
                                    value={property.status}
                                    disabled={busy}
                                    onChange={e => onStatusChange(property.id, e.target.value as PropertyStatus)}
                                >
                                    {PROPERTY_STATUSES.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className="tracker-buttons">
                                <button type="button" className="button outline small" disabled={busy} onClick={startEdit}>
                                    Швидко змінити
                                </button>
                                <Link className="text-button" to={`/products/${property.id}/edit`}>
                                    Повна форма
                                </Link>
                                <button
                                    type="button"
                                    className="text-button"
                                    disabled={busy}
                                    onClick={() => onToggleTrack(property.id)}
                                >
                                    Прибрати з трекера
                                </button>
                                <button
                                    type="button"
                                    className="text-button danger"
                                    disabled={busy}
                                    onClick={handleDelete}
                                >
                                    Видалити
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <form className="inline-edit-form" onSubmit={handleSave}>
                        <div className="inline-edit-grid">
                            <label>
                                Назва
                                <input value={name} onChange={e => setName(e.target.value)} disabled={busy} />
                            </label>
                            <label>
                                Місто
                                <input value={city} onChange={e => setCity(e.target.value)} disabled={busy} />
                            </label>
                            <label>
                                Ціна, $
                                <input
                                    type="number"
                                    min={1}
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    disabled={busy}
                                />
                            </label>
                        </div>
                        <div className="tracker-buttons">
                            <button type="submit" className="button small" disabled={busy}>
                                {busy ? 'Зберігаємо…' : 'Зберегти зміни'}
                            </button>
                            <button
                                type="button"
                                className="text-button"
                                disabled={busy}
                                onClick={() => setEditing(false)}
                            >
                                Скасувати
                            </button>
                        </div>
                    </form>
                )}
                {rowError && (
                    <p className="field-error" role="alert">
                        {rowError}
                    </p>
                )}
            </div>
        </article>
    );
}
