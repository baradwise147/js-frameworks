import {ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {propertiesApi} from '../api/propertiesApi';
import {useProperties} from '../context/PropertiesContext';
import {
    CATEGORIES,
    PRESET_IMAGES,
    PROPERTY_STATUSES,
    PropertyInput,
    PropertyStatus
} from '../types/property';

const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

interface FormState {
    name: string;
    category: string;
    city: string;
    price: string;
    area: string;
    rooms: string;
    description: string;
    image: string;
    status: PropertyStatus;
    tracked: boolean;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
    name: '',
    category: 'Квартира',
    city: '',
    price: '1',
    area: '1',
    rooms: '1',
    description: '',
    image: 'images/apartment.jpg',
    status: 'Активне',
    tracked: false
};

export function validatePropertyForm(form: FormState): FieldErrors {
    const errors: FieldErrors = {};
    const name = form.name.trim();
    const city = form.city.trim();
    const description = form.description.trim();
    const price = Number(form.price);
    const area = Number(form.area);
    const rooms = Number(form.rooms);

    if (name.length < 5 || name.length > 100) {
        errors.name = 'Вкажіть назву від 5 до 100 символів.';
    }
    if (city.length < 2 || city.length > 60) {
        errors.city = 'Вкажіть місто від 2 до 60 символів.';
    }
    if (!Number.isFinite(price) || price < 1 || price > 1000000000) {
        errors.price = 'Ціна має бути від 1 до 1 000 000 000 $.';
    }
    if (!Number.isFinite(area) || area < 1 || area > 100000) {
        errors.area = 'Площа має бути від 1 до 100 000 м².';
    }
    if (!Number.isInteger(rooms) || rooms < 1 || rooms > 1000) {
        errors.rooms = 'Вкажіть ціле число від 1 до 1000.';
    }
    if (description.length < 20 || description.length > 3000) {
        errors.description = 'Опис має містити від 20 до 3000 символів.';
    }
    return errors;
}

export default function PropertyFormPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {addProperty, editProperty} = useProperties();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
    const [loading, setLoading] = useState(Boolean(id));
    const [loadFailed, setLoadFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const revokePreview = useCallback((url: string) => {
        if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(url);
        }
    }, []);

    useEffect(() => {
        return () => revokePreview(previewUrl);
    }, [previewUrl, revokePreview]);

    const loadExisting = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setLoadFailed(false);
        setError('');
        try {
            const p = await propertiesApi.get(id);
            setForm({
                name: p.name,
                category: p.category,
                city: p.city,
                price: String(p.price),
                area: String(p.area),
                rooms: String(p.rooms),
                description: p.description,
                image: p.image,
                status: p.status,
                tracked: p.tracked
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не вдалося завантажити оголошення.');
            setLoadFailed(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            void loadExisting();
        } else {
            setForm(INITIAL_FORM);
            setLoading(false);
            setLoadFailed(false);
        }
    }, [id, loadExisting]);

    const errors = useMemo(() => validatePropertyForm(form), [form]);

    const imageOptions = useMemo(() => {
        const current = form.image;
        if (!current || PRESET_IMAGES.some(item => item.value === current)) {
            return [...PRESET_IMAGES];
        }
        const fileName = current.split('/').pop() || current;
        return [{value: current, label: `Завантажене фото (${fileName})`}, ...PRESET_IMAGES];
    }, [form.image]);

    const imagePreview = previewUrl || `/${form.image.replace(/^\/+/, '')}`;

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({...prev, [key]: value}));
    };

    const markTouched = (key: keyof FormState) => {
        setTouched(prev => ({...prev, [key]: true}));
    };

    const showError = (key: keyof FormState) => (touched[key] ? errors[key] : undefined);

    const clearSelectedFile = () => {
        revokePreview(previewUrl);
        setPreviewUrl('');
        setSelectedFile(null);
        setUploadError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            setUploadError('Оберіть зображення у форматі JPG, PNG, WebP, GIF або AVIF.');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setUploadError('Розмір файлу не повинен перевищувати 10 МБ.');
            event.target.value = '';
            return;
        }

        setUploadError('');
        revokePreview(previewUrl);
        setSelectedFile(file);
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (saving || loadFailed) return;

        setTouched({
            name: true,
            category: true,
            city: true,
            price: true,
            area: true,
            rooms: true,
            description: true,
            image: true,
            status: true,
            tracked: true
        });

        if (Object.keys(errors).length > 0) return;

        const payload: PropertyInput = {
            name: form.name.trim(),
            category: form.category,
            city: form.city.trim(),
            price: Number(form.price),
            area: Number(form.area),
            rooms: Number(form.rooms),
            description: form.description.trim(),
            image: form.image,
            status: form.status,
            tracked: form.tracked
        };

        setSaving(true);
        setError('');
        setUploadError('');

        try {
            const saved = id
                ? await editProperty(id, payload, selectedFile)
                : await addProperty(payload, selectedFile);
            navigate(`/products/${saved.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не вдалося зберегти оголошення.');
            setSaving(false);
        }
    };

    return (
        <>
            <Link className="back-link" to="/products">
                ← До каталогу
            </Link>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">ВАШ ПРОСТІР НА HAVEN</p>
                    <h1>{id ? 'Оновити оголошення' : 'Розкажіть про свій простір.'}</h1>
                    <p className="muted">Додайте основні характеристики, статус трекінгу та фотографію об’єкта.</p>
                </div>
            </div>

            {loading ? (
                <div className="state" role="status">
                    Завантажуємо дані…
                </div>
            ) : loadFailed ? (
                <div className="state error" role="alert">
                    <p>{error}</p>
                    <button type="button" className="button" onClick={() => void loadExisting()}>
                        Спробувати ще раз
                    </button>
                </div>
            ) : (
                <form className="editor" onSubmit={handleSubmit} noValidate>
                    <fieldset disabled={saving}>
                        <legend>Інформація про об’єкт</legend>
                        <div className="form-grid">
                            <label className="full">
                                Назва оголошення
                                <input
                                    value={form.name}
                                    maxLength={100}
                                    placeholder="Наприклад, світла квартира біля парку"
                                    aria-invalid={Boolean(showError('name'))}
                                    aria-describedby="name-error"
                                    onBlur={() => markTouched('name')}
                                    onChange={e => updateField('name', e.target.value)}
                                />
                                {showError('name') && (
                                    <small className="field-error" id="name-error">
                                        {showError('name')}
                                    </small>
                                )}
                            </label>

                            <label>
                                Тип нерухомості
                                <select value={form.category} onChange={e => updateField('category', e.target.value)}>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Місто
                                <input
                                    value={form.city}
                                    maxLength={60}
                                    placeholder="Київ"
                                    aria-invalid={Boolean(showError('city'))}
                                    aria-describedby="city-error"
                                    onBlur={() => markTouched('city')}
                                    onChange={e => updateField('city', e.target.value)}
                                />
                                {showError('city') && (
                                    <small className="field-error" id="city-error">
                                        {showError('city')}
                                    </small>
                                )}
                            </label>

                            <label>
                                Ціна, $
                                <input
                                    type="number"
                                    min={1}
                                    value={form.price}
                                    aria-invalid={Boolean(showError('price'))}
                                    aria-describedby="price-error"
                                    onBlur={() => markTouched('price')}
                                    onChange={e => updateField('price', e.target.value)}
                                />
                                {showError('price') && (
                                    <small className="field-error" id="price-error">
                                        {showError('price')}
                                    </small>
                                )}
                            </label>

                            <label>
                                Площа, м²
                                <input
                                    type="number"
                                    min={1}
                                    value={form.area}
                                    aria-invalid={Boolean(showError('area'))}
                                    aria-describedby="area-error"
                                    onBlur={() => markTouched('area')}
                                    onChange={e => updateField('area', e.target.value)}
                                />
                                {showError('area') && (
                                    <small className="field-error" id="area-error">
                                        {showError('area')}
                                    </small>
                                )}
                            </label>

                            <label>
                                Кімнат / приміщень
                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={form.rooms}
                                    aria-invalid={Boolean(showError('rooms'))}
                                    aria-describedby="rooms-error"
                                    onBlur={() => markTouched('rooms')}
                                    onChange={e => updateField('rooms', e.target.value)}
                                />
                                {showError('rooms') && (
                                    <small className="field-error" id="rooms-error">
                                        {showError('rooms')}
                                    </small>
                                )}
                            </label>

                            <label>
                                Статус трекінгу
                                <select
                                    value={form.status}
                                    onChange={e => updateField('status', e.target.value as PropertyStatus)}
                                >
                                    {PROPERTY_STATUSES.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="full checkbox-inline">
                                <input
                                    type="checkbox"
                                    checked={form.tracked}
                                    onChange={e => updateField('tracked', e.target.checked)}
                                />
                                <span>Додати цей об’єкт у мій трекер відстеження</span>
                            </label>

                            <div className="full photo-upload">
                                <span className="field-label">Фотографія об’єкта</span>
                                <div className="photo-upload-layout">
                                    <img
                                        className="photo-preview"
                                        src={imagePreview}
                                        alt="Попередній перегляд фотографії"
                                    />
                                    <div className="photo-upload-controls">
                                        <div className="upload-row">
                                            <label className="button outline small upload-trigger">
                                                Завантажити з ПК
                                                <input
                                                    ref={fileInputRef}
                                                    className="sr-only"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                                    onChange={handleFileSelected}
                                                />
                                            </label>
                                            {selectedFile && (
                                                <>
                                                    <span className="upload-filename" title={selectedFile.name}>
                                                        {selectedFile.name}
                                                    </span>
                                                    <button
                                                        className="text-button"
                                                        type="button"
                                                        onClick={clearSelectedFile}
                                                    >
                                                        Скасувати файл
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <small className="upload-hint">
                                            JPG, PNG, WebP, GIF або AVIF до 10 МБ — файл збережеться у{' '}
                                            <code>public/images</code>.
                                        </small>
                                        {uploadError && (
                                            <small className="field-error" role="alert">
                                                {uploadError}
                                            </small>
                                        )}
                                        <label className="preset-select">
                                            Або оберіть готове фото
                                            <select
                                                value={form.image}
                                                onChange={e => {
                                                    updateField('image', e.target.value);
                                                    if (selectedFile) clearSelectedFile();
                                                }}
                                            >
                                                {imageOptions.map(image => (
                                                    <option key={image.value} value={image.value}>
                                                        {image.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <label className="full">
                                Опис
                                <textarea
                                    rows={5}
                                    maxLength={3000}
                                    value={form.description}
                                    placeholder="Планування, розташування, особливості…"
                                    aria-invalid={Boolean(showError('description'))}
                                    aria-describedby="description-error"
                                    onBlur={() => markTouched('description')}
                                    onChange={e => updateField('description', e.target.value)}
                                />
                                {showError('description') && (
                                    <small className="field-error" id="description-error">
                                        {showError('description')}
                                    </small>
                                )}
                            </label>
                        </div>

                        <div className="form-actions">
                            <button className="button" type="submit">
                                {saving ? 'Зберігаємо…' : 'Зберегти оголошення ↗'}
                            </button>
                            <Link className="text-button" to="/products">
                                Скасувати
                            </Link>
                        </div>
                    </fieldset>

                    {error && (
                        <p className="error" role="alert" style={{marginTop: 18}}>
                            {error}
                        </p>
                    )}
                </form>
            )}
        </>
    );
}
