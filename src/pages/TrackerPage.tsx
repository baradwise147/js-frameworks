import {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {TrackerRow} from '../components/TrackerRow';
import {TrackerStats} from '../components/TrackerStats';
import {useProperties} from '../context/PropertiesContext';
import {PropertyInput, PROPERTY_STATUSES, PropertyStatus} from '../types/property';

export default function TrackerPage() {
    const {properties, loading, error, stats, reload, quickEditProperty, removeProperty, toggleTracked, changeStatus} =
        useProperties();
    const [statusFilter, setStatusFilter] = useState<'Усі' | PropertyStatus>('Усі');
    const [actionError, setActionError] = useState('');

    const trackedItems = useMemo(
        () =>
            properties.filter(
                item => item.tracked && (statusFilter === 'Усі' || item.status === statusFilter)
            ),
        [properties, statusFilter]
    );

    const handleQuickEdit = useCallback(
        async (id: string, changes: Partial<PropertyInput>) => {
            await quickEditProperty(id, changes);
        },
        [quickEditProperty]
    );

    const handleStatusChange = useCallback(
        async (id: string, status: PropertyStatus) => {
            setActionError('');
            try {
                await changeStatus(id, status);
            } catch (err) {
                setActionError(err instanceof Error ? err.message : 'Не вдалося оновити статус.');
            }
        },
        [changeStatus]
    );

    const handleToggleTrack = useCallback(
        async (id: string) => {
            setActionError('');
            try {
                await toggleTracked(id);
            } catch (err) {
                setActionError(err instanceof Error ? err.message : 'Не вдалося оновити трекер.');
            }
        },
        [toggleTracked]
    );

    const handleDelete = useCallback(
        async (id: string) => {
            await removeProperty(id);
        },
        [removeProperty]
    );

    return (
        <>
            <Link className="back-link" to="/products">
                ← До каталогу
            </Link>
            <section className="page-heading">
                <div>
                    <p className="eyebrow">ТРЕКІНГ СУТНОСТЕЙ</p>
                    <h1>Трекер об’єктів.</h1>
                    <p className="muted">
                        Відстежуйте статус переглядів, швидко редагуйте ключові параметри та керуйте обраною
                        нерухомістю.
                    </p>
                </div>
                <Link className="button" to="/products/new">
                    Додати оголошення ↗
                </Link>
            </section>

            <TrackerStats stats={stats} />

            <div className="tracker-tabs" role="tablist" aria-label="Фільтр за статусом у трекері">
                {(['Усі', ...PROPERTY_STATUSES] as const).map(tab => (
                    <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === tab}
                        className={`tab-pill ${statusFilter === tab ? 'active' : ''}`}
                        onClick={() => setStatusFilter(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {actionError && (
                <p className="error" role="alert">
                    {actionError}
                </p>
            )}

            {loading ? (
                <div className="state" role="status">
                    Завантажуємо трекер…
                </div>
            ) : error ? (
                <div className="state error" role="alert">
                    <p>{error}</p>
                    <button type="button" className="button" onClick={() => void reload()}>
                        Спробувати ще раз
                    </button>
                </div>
            ) : trackedItems.length === 0 ? (
                <div className="state">
                    <h2>У трекері поки порожньо</h2>
                    <p>Позначте зірочкою цікаві об’єкти в каталозі або оберіть інший статус.</p>
                    <Link className="button outline" to="/products">
                        Перейти до каталогу
                    </Link>
                </div>
            ) : (
                <div className="tracker-list">
                    {trackedItems.map(item => (
                        <TrackerRow
                            key={item.id}
                            property={item}
                            onEdit={handleQuickEdit}
                            onStatusChange={handleStatusChange}
                            onToggleTrack={handleToggleTrack}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
