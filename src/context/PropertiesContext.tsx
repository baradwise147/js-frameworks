import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {propertiesApi} from '../api/propertiesApi';
import {Property, PropertyInput, PropertyStatus} from '../types/property';

export interface TrackerSummary {
    total: number;
    tracked: number;
    active: number;
    viewing: number;
    reserved: number;
    sold: number;
}

export interface PropertiesContextValue {
    properties: Property[];
    loading: boolean;
    error: string;
    stats: TrackerSummary;
    reload: () => Promise<void>;
    addProperty: (input: PropertyInput, file?: File | null) => Promise<Property>;
    editProperty: (id: string, input: PropertyInput, file?: File | null) => Promise<Property>;
    quickEditProperty: (id: string, changes: Partial<PropertyInput>) => Promise<Property>;
    removeProperty: (id: string) => Promise<void>;
    toggleTracked: (id: string) => Promise<void>;
    changeStatus: (id: string, status: PropertyStatus) => Promise<void>;
}

const PropertiesContext = createContext<PropertiesContextValue | null>(null);

export function PropertiesProvider({children}: {children: ReactNode}) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reload = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await propertiesApi.list();
            setProperties(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не вдалося завантажити каталог.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    const addProperty = useCallback(async (input: PropertyInput, file?: File | null) => {
        let image = input.image;
        if (file) {
            const uploaded = await propertiesApi.uploadImage(file);
            image = uploaded.path;
        }
        const created = await propertiesApi.create({...input, image});
        setProperties(prev => [...prev, created]);
        return created;
    }, []);

    const editProperty = useCallback(async (id: string, input: PropertyInput, file?: File | null) => {
        let image = input.image;
        if (file) {
            const uploaded = await propertiesApi.uploadImage(file);
            image = uploaded.path;
        }
        const updated = await propertiesApi.update(id, {...input, image});
        setProperties(prev => prev.map(item => (item.id === id ? updated : item)));
        return updated;
    }, []);

    const quickEditProperty = useCallback(async (id: string, changes: Partial<PropertyInput>) => {
        const updated = await propertiesApi.patch(id, changes);
        setProperties(prev => prev.map(item => (item.id === id ? updated : item)));
        return updated;
    }, []);

    const removeProperty = useCallback(async (id: string) => {
        await propertiesApi.remove(id);
        setProperties(prev => prev.filter(item => item.id !== id));
    }, []);

    const toggleTracked = useCallback(
        async (id: string) => {
            const current = properties.find(item => item.id === id);
            if (!current) return;
            const nextTracked = !current.tracked;
            setProperties(prev => prev.map(item => (item.id === id ? {...item, tracked: nextTracked} : item)));
            try {
                const updated = await propertiesApi.patch(id, {tracked: nextTracked});
                setProperties(prev => prev.map(item => (item.id === id ? updated : item)));
            } catch (err) {
                setProperties(prev => prev.map(item => (item.id === id ? current : item)));
                throw err;
            }
        },
        [properties]
    );

    const changeStatus = useCallback(
        async (id: string, status: PropertyStatus) => {
            const current = properties.find(item => item.id === id);
            if (!current || current.status === status) return;
            setProperties(prev => prev.map(item => (item.id === id ? {...item, status} : item)));
            try {
                const updated = await propertiesApi.patch(id, {status});
                setProperties(prev => prev.map(item => (item.id === id ? updated : item)));
            } catch (err) {
                setProperties(prev => prev.map(item => (item.id === id ? current : item)));
                throw err;
            }
        },
        [properties]
    );

    const stats = useMemo<TrackerSummary>(() => {
        return properties.reduce<TrackerSummary>(
            (acc, item) => {
                acc.total += 1;
                if (item.tracked) acc.tracked += 1;
                if (item.status === 'Активне') acc.active += 1;
                if (item.status === 'Перегляд') acc.viewing += 1;
                if (item.status === 'Заброньовано') acc.reserved += 1;
                if (item.status === 'Продано') acc.sold += 1;
                return acc;
            },
            {total: 0, tracked: 0, active: 0, viewing: 0, reserved: 0, sold: 0}
        );
    }, [properties]);

    const value = useMemo<PropertiesContextValue>(
        () => ({
            properties,
            loading,
            error,
            stats,
            reload,
            addProperty,
            editProperty,
            quickEditProperty,
            removeProperty,
            toggleTracked,
            changeStatus
        }),
        [
            properties,
            loading,
            error,
            stats,
            reload,
            addProperty,
            editProperty,
            quickEditProperty,
            removeProperty,
            toggleTracked,
            changeStatus
        ]
    );

    return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
}

export function useProperties(): PropertiesContextValue {
    const ctx = useContext(PropertiesContext);
    if (!ctx) {
        throw new Error('useProperties must be used within PropertiesProvider');
    }
    return ctx;
}
