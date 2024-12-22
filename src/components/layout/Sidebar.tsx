import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, Book, Search, User, BookOpen, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
    const navItems = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/search', icon: Search, label: 'Search' },
        { to: '/movies', icon: Film, label: 'Movies' },
        { to: '/tv', icon: Tv, label: 'TV Shows' },
        { to: '/books', icon: Book, label: 'Books' },
        { to: '/reading-list', icon: BookOpen, label: 'Reading List' },
        { to: '/profile', icon: User, label: 'Profile' },
        { to: '/profile/settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <nav className="p-4">
                <ul className="space-y-2">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar; 