import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div>
            <label
                htmlFor={props.id || props.name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {label}
            </label>
            <div className="mt-1">
                <input
                    {...props}
                    className={`
                        appearance-none block w-full px-3 py-2 border rounded-md shadow-sm 
                        placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                        ${error ? 'border-red-300' : 'border-gray-300'} 
                        ${className}
                    `}
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Input; 