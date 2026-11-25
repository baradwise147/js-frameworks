import {lazy, Suspense} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {Layout} from './components/Layout';
import {PropertiesProvider} from './context/PropertiesContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const TrackerPage = lazy(() => import('./pages/TrackerPage'));
const PropertyDetailsPage = lazy(() => import('./pages/PropertyDetailsPage'));
const PropertyFormPage = lazy(() => import('./pages/PropertyFormPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export function AppRoutes() {
    return (
        <Suspense
            fallback={
                <div className="state" role="status">
                    Завантажуємо сторінку…
                </div>
            }
        >
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<CatalogPage />} />
                    <Route path="/tracker" element={<TrackerPage />} />
                    <Route path="/products/new" element={<PropertyFormPage />} />
                    <Route path="/products/:id" element={<PropertyDetailsPage />} />
                    <Route path="/products/:id/edit" element={<PropertyFormPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <PropertiesProvider>
                <AppRoutes />
            </PropertiesProvider>
        </BrowserRouter>
    );
}
