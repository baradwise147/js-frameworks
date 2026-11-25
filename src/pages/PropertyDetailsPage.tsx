import {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {propertiesApi} from '../api/propertiesApi';
import {useProperties} from '../context/PropertiesContext';
import {formatPrice, Property, PROPERTY_STATUSES, PropertyStatus} from '../types/property';

export default function PropertyDetailsPage() {
    const {id = ''} = useParams();
    const navigate = useNavigate();
    const {removeProperty, toggleTracked, changeStatus} = useProperties();

    const [product, setProduct] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState('');

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        setProduct(null);
        try {
            const data = await propertiesApi.get(id);
            setProduct(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не вдалося завантажити об’єкт.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setConfirming(false);
        void load();
    }, [load]);

    const handleToggleTrack = async () => {
        if (!product) return;
        setActionError('');
        try {
            await toggleTracked(product.id);
            setProduct(prev => (prev ? {...prev, tracked: !prev.tracked} : prev));
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Не вдалося оновити трекер.');
        }
    };

    const handleStatusChange = async (status: PropertyStatus) => {
        if (!product) return;
        setActionError('');
        try {
            await changeStatus(product.id, status);
            setProduct(prev => (prev ? {...prev, status} : prev));
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Не вдалося оновити статус.');
        }
    };

    const handleDelete = async () => {
        if (!product || deleting) return;
        setDeleting(true);
        setActionError('');
        try {
            await removeProperty(product.id);
            navigate('/products');
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Не вдалося видалити оголошення.');
            setDeleting(false);
        }
    };

    return (
        <>
            <Link className="back-link" to="/products">
                ← До каталогу
            </Link>

            {loading ? (
                <div className="state" role="status">
                    Завантажуємо об’єкт…
                </div>
            ) : error ? (
                <div className="state error" role="alert">
                    <h1>Об’єкт недоступний</h1>
                    <p>{error}</p>
                    <button type="button" className="button" onClick={() => void load()}>
                        Спробувати ще раз
                    </button>
                </div>
            ) : product ? (
                <>
                    <section className="detail-heading">
                        <div>
                            <p className="eyebrow">
                                {product.category} / {product.city} · {product.status}
                            </p>
                            <h1>{product.name}</h1>
                        </div>
                        <strong className="detail-price">{formatPrice(product.price)}</strong>
                    </section>

                    <img
                        className="detail-photo"
                        src={`/${product.image.replace(/^\/+/, '')}`}
                        alt={product.name}
                        width={1200}
                        height={700}
                    />

                    <div className="detail-layout">
                        <section>
                            <div className="facts">
                                <div>
                                    <span>Площа</span>
                                    <strong>{product.area} м²</strong>
                                </div>
                                <div>
                                    <span>Кімнат / приміщень</span>
                                    <strong>{product.rooms}</strong>
                                </div>
                                <div>
                                    <span>Місто</span>
                                    <strong>{product.city}</strong>
                                </div>
                                <div>
                                    <span>Статус</span>
                                    <strong>{product.status}</strong>
                                </div>
                            </div>
                            <h2>Про цей простір</h2>
                            <p className="description">{product.description}</p>
                        </section>

                        <aside className="management">
                            <p className="eyebrow">КЕРУВАННЯ ТА ТРЕКІНГ</p>
                            <h2>Деталі мають значення.</h2>
                            <p>Оновіть статус, додайте об’єкт у трекер або відредагуйте характеристики.</p>

                            <div className="detail-track-controls">
                                <label>
                                    Статус об’єкта
                                    <select
                                        value={product.status}
                                        onChange={e => void handleStatusChange(e.target.value as PropertyStatus)}
                                    >
                                        {PROPERTY_STATUSES.map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <button
                                    type="button"
                                    className={`button outline ${product.tracked ? 'tracked-btn' : ''}`}
                                    onClick={() => void handleToggleTrack()}
                                >
                                    {product.tracked ? '★ Відстежується у трекері' : '☆ Додати у трекер'}
                                </button>
                            </div>

                            <Link className="button" to={`/products/${product.id}/edit`}>
                                Редагувати ↗
                            </Link>

                            {!confirming ? (
                                <button
                                    type="button"
                                    className="text-button danger"
                                    onClick={() => setConfirming(true)}
                                >
                                    Видалити оголошення
                                </button>
                            ) : (
                                <div className="confirm" role="group" aria-label="Підтвердження видалення">
                                    <p>Видалити «{product.name}»? Цю дію не можна скасувати.</p>
                                    <button
                                        type="button"
                                        className="button danger-button"
                                        disabled={deleting}
                                        onClick={() => void handleDelete()}
                                    >
                                        {deleting ? 'Видаляємо…' : 'Так, видалити'}
                                    </button>
                                    <button
                                        type="button"
                                        className="text-button"
                                        disabled={deleting}
                                        onClick={() => setConfirming(false)}
                                    >
                                        Скасувати
                                    </button>
                                </div>
                            )}

                            {actionError && (
                                <p className="error" role="alert">
                                    {actionError}
                                </p>
                            )}
                        </aside>
                    </div>
                </>
            ) : null}
        </>
    );
}
