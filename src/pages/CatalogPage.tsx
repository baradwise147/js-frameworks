import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {PropertyCard} from '../components/PropertyCard';
import {TrackerStats} from '../components/TrackerStats';
import {useProperties} from '../context/PropertiesContext';
import {CATEGORIES, PROPERTY_STATUSES, PropertyStatus} from '../types/property';

const PAGE_SIZE = 6;

export default function CatalogPage() {
    const {properties, loading, error, stats, reload, toggleTracked, changeStatus} = useProperties();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const initialCategory = searchParams.get('category') ?? '';
    const [category, setCategory] = useState(
        CATEGORIES.some(c => c === initialCategory) ? initialCategory : ''
    );
    const [city, setCity] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [onlyTracked, setOnlyTracked] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        const paramCategory = searchParams.get('category') ?? '';
        const valid = CATEGORIES.some(c => c === paramCategory) ? paramCategory : '';
        setCategory(valid);
        setPage(1);
    }, [searchParams]);

    const cities = useMemo(
        () => [...new Set(properties.map(item => item.city))].sort((a, b) => a.localeCompare(b, 'uk')),
        [properties]
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('uk');
        return properties.filter(
            item =>
                (!category || item.category === category) &&
                (!city || item.city === city) &&
                (!statusFilter || item.status === statusFilter) &&
                (!onlyTracked || item.tracked) &&
                item.name.toLocaleLowerCase('uk').includes(query)
        );
    }, [properties, category, city, statusFilter, onlyTracked, search]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, pageCount);

    const visible = useMemo(
        () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
        [filtered, safePage]
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

    const handleStatusChange = useCallback(
        async (id: string, status: PropertyStatus) => {
            setActionError('');
            try {
                await changeStatus(id, status);
            } catch (err) {
                setActionError(err instanceof Error ? err.message : 'Не вдалося змінити статус.');
            }
        },
        [changeStatus]
    );

    const handleReset = () => {
        setCategory('');
        setCity('');
        setStatusFilter('');
        setOnlyTracked(false);
        setSearch('');
        setPage(1);
        setSearchParams({});
        searchInputRef.current?.focus();
    };

    return (
        <>
            <section className="page-heading">
                <div>
                    <p className="eyebrow">КАТАЛОГ HAVEN</p>
                    <h1>Знайдіть свій простір.</h1>
                    <p className="muted">Від затишної квартири до будинку з власним садом.</p>
                </div>
                <Link className="button outline" to="/products/new">
                    Додати оголошення ↗
                </Link>
            </section>

            <TrackerStats stats={stats}>
                <Link className="button small" to="/tracker">
                    Відкрити трекер ({stats.tracked}) →
                </Link>
            </TrackerStats>

            <div className="filters filters-extended">
                <label>
                    Пошук
                    <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Назва об’єкта"
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </label>
                <label>
                    Тип нерухомості
                    <select
                        value={category}
                        onChange={e => {
                            const next = e.target.value;
                            setCategory(next);
                            setPage(1);
                            setSearchParams(next ? {category: next} : {});
                        }}
                    >
                        <option value="">Усі типи</option>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Місто
                    <select
                        value={city}
                        onChange={e => {
                            setCity(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Усі міста</option>
                        {cities.map(c => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Статус
                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Усі статуси</option>
                        {PROPERTY_STATUSES.map(status => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="button" className="button outline" onClick={handleReset}>
                    Скинути
                </button>
                <label className="checkbox-filter">
                    <input
                        type="checkbox"
                        checked={onlyTracked}
                        onChange={e => {
                            setOnlyTracked(e.target.checked);
                            setPage(1);
                        }}
                    />
                    <span>Лише відстежувані ({stats.tracked})</span>
                </label>
            </div>

            {actionError && (
                <p className="error" role="alert" style={{marginTop: 18}}>
                    {actionError}
                </p>
            )}

            {loading ? (
                <div className="state" role="status">
                    Завантажуємо оголошення…
                </div>
            ) : error ? (
                <div className="state error" role="alert">
                    <h2>Не вдалося завантажити каталог</h2>
                    <p>{error}</p>
                    <button type="button" className="button" onClick={() => void reload()}>
                        Спробувати ще раз
                    </button>
                </div>
            ) : (
                <>
                    <div className="results-line" aria-live="polite">
                        <span>Знайдено: {filtered.length}</span>
                        <span>
                            Сторінка {safePage} із {pageCount}
                        </span>
                    </div>
                    <div className="property-grid">
                        {visible.length > 0 ? (
                            visible.map(property => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    onToggleTrack={handleToggleTrack}
                                    onStatusChange={handleStatusChange}
                                />
                            ))
                        ) : (
                            <div className="state empty">
                                <h2>Поки що нічого не знайшли.</h2>
                                <p>Спробуйте інше місто, статус, назву або тип нерухомості.</p>
                                <button type="button" className="button outline" onClick={handleReset}>
                                    Скинути фільтри
                                </button>
                            </div>
                        )}
                    </div>
                    {pageCount > 1 && (
                        <nav className="pagination" aria-label="Сторінки каталогу">
                            <button
                                type="button"
                                className="button outline"
                                disabled={safePage === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                ← Назад
                            </button>
                            <span aria-live="polite">
                                {safePage} / {pageCount}
                            </span>
                            <button
                                type="button"
                                className="button outline"
                                disabled={safePage === pageCount}
                                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                            >
                                Далі →
                            </button>
                        </nav>
                    )}
                </>
            )}
        </>
    );
}
