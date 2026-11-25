import {Link} from 'react-router-dom';

const HOME_CATEGORIES = [
    {
        name: 'Квартира',
        title: 'Квартири',
        number: '01',
        description: 'Свій куточок у великому місті.'
    },
    {
        name: 'Будинок',
        title: 'Будинки',
        number: '02',
        description: 'Більше місця для важливого.'
    },
    {
        name: 'Будівля',
        title: 'Для бізнесу',
        number: '03',
        description: 'Адреса для ваших амбіцій.'
    }
];

export default function HomePage() {
    return (
        <>
            <section className="hero">
                <div className="hero-copy">
                    <p className="eyebrow">ЗНАЙДІТЬ СВОЄ МІСЦЕ</p>
                    <h1>
                        Більше простору.
                        <br />
                        <em>Більше життя.</em>
                    </h1>
                    <p className="hero-description">
                        Квартира у ритмі міста чи будинок ближче до природи? Ваш наступний крок починається тут.
                    </p>
                    <div className="hero-actions">
                        <Link className="button light" to="/products">
                            Переглянути нерухомість ↗
                        </Link>
                        <Link className="button hero-ghost" to="/tracker">
                            Трекер об’єктів
                        </Link>
                    </div>
                    <div className="hero-note">
                        <span className="line" />
                        Квартири · Будинки · Комерційні будівлі
                    </div>
                </div>
                <div className="hero-visual">
                    <img src="/images/house.jpg" alt="Сучасний будинок із садом" width={1000} height={1000} />
                    <div className="image-caption">
                        <span>ВАШ НОВИЙ ПОЧАТОК</span>
                        <strong>Місце, куди хочеться повертатися.</strong>
                    </div>
                </div>
            </section>

            <section className="intro">
                <p className="eyebrow">ПРОСТІР ПІД ВАШІ ПЛАНИ</p>
                <div className="section-heading">
                    <h2>Від мрії до власного ключа.</h2>
                    <p>Обирайте те, що відповідає вашому стилю життя. Усі варіанти — в одному каталозі.</p>
                </div>
                <div className="category-grid">
                    {HOME_CATEGORIES.map(category => (
                        <Link
                            key={category.name}
                            className="category-tile"
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                        >
                            <span>{category.number} /</span>
                            <h3>{category.title}</h3>
                            <p>{category.description}</p>
                            <span className="tile-arrow">↗</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="closing">
                <div>
                    <p className="eyebrow">НОВА ІСТОРІЯ ПОЧИНАЄТЬСЯ ТУТ</p>
                    <h2>Маєте простір для когось?</h2>
                    <p>Додайте своє оголошення, завантажте фото та відстежуйте статус об’єкта в трекері.</p>
                </div>
                <Link className="button" to="/products/new">
                    Додати оголошення ↗
                </Link>
            </section>
        </>
    );
}
