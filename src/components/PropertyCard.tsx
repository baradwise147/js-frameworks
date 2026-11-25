import {memo} from 'react';
import {Link} from 'react-router-dom';
import {formatPrice, Property, PROPERTY_STATUSES, PropertyStatus} from '../types/property';

interface PropertyCardProps {
    property: Property;
    onToggleTrack: (id: string) => void;
    onStatusChange: (id: string, status: PropertyStatus) => void;
}

const statusClassMap: Record<PropertyStatus, string> = {
    Активне: 'status-active',
    Перегляд: 'status-viewing',
    Заброньовано: 'status-reserved',
    Продано: 'status-sold'
};

export const PropertyCard = memo(function PropertyCard({
    property,
    onToggleTrack,
    onStatusChange
}: PropertyCardProps) {
    return (
        <article className="property-card">
            <div className="photo-link">
                <Link to={`/products/${property.id}`} aria-label={property.name}>
                    <img
                        src={`/${property.image.replace(/^\/+/, '')}`}
                        alt={property.name}
                        loading="lazy"
                        width={800}
                        height={540}
                    />
                </Link>
                <span className="badge">{property.category}</span>
                <button
                    type="button"
                    className={`track-pill ${property.tracked ? 'tracked' : ''}`}
                    onClick={() => onToggleTrack(property.id)}
                    aria-pressed={property.tracked}
                    aria-label={property.tracked ? 'Прибрати з трекера' : 'Додати в трекер'}
                >
                    {property.tracked ? '★ У трекері' : '☆ Відстежувати'}
                </button>
            </div>
            <div className="card-content">
                <p className="muted location">
                    <span>{property.city}</span>
                    <span>• {property.area} м²</span>
                </p>
                <h3>
                    <Link to={`/products/${property.id}`}>{property.name}</Link>
                </h3>
                <div className="card-tracking-row">
                    <span className={`status-dot ${statusClassMap[property.status]}`}>{property.status}</span>
                    <select
                        className="status-select"
                        aria-label={`Статус для ${property.name}`}
                        value={property.status}
                        onChange={e => onStatusChange(property.id, e.target.value as PropertyStatus)}
                    >
                        {PROPERTY_STATUSES.map(status => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="card-bottom">
                    <strong>{formatPrice(property.price)}</strong>
                    <Link className="round-link" to={`/products/${property.id}`} aria-label={`Деталі: ${property.name}`}>
                        ↗
                    </Link>
                </div>
            </div>
        </article>
    );
});
