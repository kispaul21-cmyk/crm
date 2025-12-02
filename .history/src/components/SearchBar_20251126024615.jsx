import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, onFilterClick }) => {
    return (
        <div className="w-80 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-2 flex-shrink-0">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или компании..."
                className="flex-1 outline-none text-sm"
            />
            <button
                onClick={onFilterClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600"
                title="Фильтры"
            >
                <Filter size={18} />
            </button>
        </div>
    );
};

export default SearchBar;
