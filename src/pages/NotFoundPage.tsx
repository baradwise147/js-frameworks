import {Link} from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <section className="state">
            <p className="eyebrow">404</p>
            <h1>Сторінку не знайдено</h1>
            <p className="muted">Перевірте адресу або поверніться до каталогу нерухомості.</p>
            <Link className="button" to="/products">
                До каталогу ↗
            </Link>
        </section>
    );
}
