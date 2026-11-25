import {ReactNode} from 'react';
import {TrackerSummary} from '../context/PropertiesContext';

interface TrackerStatsProps {
    stats: TrackerSummary;
    children?: ReactNode;
}

export function TrackerStats({stats, children}: TrackerStatsProps) {
    return (
        <section className="tracker-summary" aria-label="Статистика трекінгу об’єктів">
            <div className="stat-box">
                <span>Усього об’єктів</span>
                <strong>{stats.total}</strong>
            </div>
            <div className="stat-box highlight">
                <span>У трекері</span>
                <strong>{stats.tracked}</strong>
            </div>
            <div className="stat-box">
                <span>Активні</span>
                <strong>{stats.active}</strong>
            </div>
            <div className="stat-box">
                <span>На перегляді</span>
                <strong>{stats.viewing}</strong>
            </div>
            <div className="stat-box">
                <span>Заброньовано</span>
                <strong>{stats.reserved}</strong>
            </div>
            {children && <div className="stat-extra">{children}</div>}
        </section>
    );
}
