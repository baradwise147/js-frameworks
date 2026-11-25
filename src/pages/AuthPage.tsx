import {FormEvent, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function AuthPage() {
    const {login, register, isAuthenticated, user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as {from?: string} | null)?.from || '/products';

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedName = userName.trim();
        if (trimmedName.length < 3) {
            setError('Ім’я користувача має містити щонайменше 3 символи.');
            return;
        }
        if (password.length < 6) {
            setError('Пароль має містити щонайменше 6 символів.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            if (mode === 'login') {
                await login(trimmedName, password);
            } else {
                await register(trimmedName, password);
            }
            navigate(from, {replace: true});
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не вдалося виконати авторизацію.');
            setSubmitting(false);
        }
    };

    if (isAuthenticated && user) {
        return (
            <section className="auth-card">
                <p className="eyebrow">АВТОРИЗАЦІЯ HAVEN</p>
                <h1>Ви увійшли як {user.userName}</h1>
                <p className="muted">
                    Тепер ви можете додавати й редагувати оголошення, завантажувати фото та керувати трекером.
                </p>
                <div className="form-actions">
                    <Link className="button" to="/products">
                        До каталогу ↗
                    </Link>
                    <button type="button" className="text-button danger" onClick={logout}>
                        Вийти з акаунта
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="auth-card">
            <p className="eyebrow">JWT АВТЕНТИФІКАЦІЯ</p>
            <h1>{mode === 'login' ? 'Вхід до Haven.' : 'Створити акаунт.'}</h1>
            <p className="muted">
                Перегляд каталогу відкритий для всіх. Увійдіть, щоб додавати, редагувати або видаляти оголошення.
            </p>

            <div className="auth-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'login'}
                    className={`tab-pill ${mode === 'login' ? 'active' : ''}`}
                    onClick={() => {
                        setMode('login');
                        setError('');
                    }}
                >
                    Вхід
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'register'}
                    className={`tab-pill ${mode === 'register' ? 'active' : ''}`}
                    onClick={() => {
                        setMode('register');
                        setError('');
                    }}
                >
                    Реєстрація
                </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <label>
                    Ім’я користувача
                    <input
                        value={userName}
                        maxLength={40}
                        autoComplete="username"
                        placeholder="Наприклад, olena"
                        disabled={submitting}
                        onChange={e => setUserName(e.target.value)}
                    />
                </label>
                <label>
                    Пароль
                    <input
                        type="password"
                        value={password}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        placeholder="Мінімум 6 символів"
                        disabled={submitting}
                        onChange={e => setPassword(e.target.value)}
                    />
                </label>

                {error && (
                    <p className="error" role="alert">
                        {error}
                    </p>
                )}

                <div className="form-actions">
                    <button type="submit" className="button" disabled={submitting}>
                        {submitting
                            ? 'Зачекайте…'
                            : mode === 'login'
                                ? 'Увійти ↗'
                                : 'Зареєструватися ↗'}
                    </button>
                    <Link className="text-button" to="/products">
                        Повернутися до каталогу
                    </Link>
                </div>
            </form>
        </section>
    );
}
