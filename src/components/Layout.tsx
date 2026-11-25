import {Link, NavLink, Outlet} from 'react-router-dom';
import {useProperties} from '../context/PropertiesContext';

export function Layout() {
    const {stats} = useProperties();

    return (
        <>
            <a className="skip" href="#main">
                До вмісту
            </a>
            <header>
                <nav className="shell navigation" aria-label="Головна навігація">
                    <Link className="brand" to="/">
                        <img src="/logo.svg" alt="" width={38} height={38} />
                        HAVEN<span>REAL ESTATE</span>
                    </Link>
                    <div className="nav-links">
                        <NavLink to="/" end className={({isActive}) => (isActive ? 'active' : undefined)}>
                            Головна
                        </NavLink>
                        <NavLink to="/products" end className={({isActive}) => (isActive ? 'active' : undefined)}>
                            Нерухомість
                        </NavLink>
                        <NavLink to="/tracker" className={({isActive}) => (isActive ? 'active' : undefined)}>
                            Трекер
                            {stats.tracked > 0 && <span className="nav-count">{stats.tracked}</span>}
                        </NavLink>
                    </div>
                    <Link className="button small" to="/products/new">
                        Додати оголошення <span aria-hidden="true">↗</span>
                    </Link>
                </nav>
            </header>
            <main id="main" className="shell">
                <Outlet />
            </main>
            <footer className="shell">
                <Link className="brand" to="/">
                    HAVEN
                </Link>
                <p>Простір для ваших наступних кроків.</p>
                <span>© 2026 Haven · React</span>
            </footer>
        </>
    );
}
