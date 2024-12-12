import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    const links = [
        { name: 'Nosotros', href: '/nosotros' },
        { name: 'Contactos', href: '/contactos' }
    ];

    return (
        <footer className="bg-orange-500 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-4">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-white sm:text-center">
                    © 2024 <a className="hover:underline">StockLiteEasy</a>. Todos los derechos reservados.
                </span>
                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white sm:mt-0">
                    {links.map((link, index) => (
                        <li key={index}>
                            <motion.a
                                href={link.href}
                                className="hover:underline me-4 md:me-6"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                {link.name}
                            </motion.a>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
};

export default Footer;