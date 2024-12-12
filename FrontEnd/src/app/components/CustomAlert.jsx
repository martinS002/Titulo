// src/components/CustomAlert.jsx
import React from 'react';

const CustomAlert = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md">
                <p>{message}</p>
                <button
                    onClick={onClose}
                    className="mt-2 bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default CustomAlert;