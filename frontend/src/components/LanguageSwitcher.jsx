import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'shona', label: 'Shona' },
  { code: 'ndebele', label: 'Ndebele' },
  { code: 'kalanga', label: 'Kalanga' },
  { code: 'venda', label: 'Venda' },
  { code: 'sotho-tonga', label: 'Sotho‑Tonga' },
];

const LanguageSwitcher = ({ onSelect }) => {
  const stored = localStorage.getItem('preferredLanguage');
  const initial = LANGUAGES.find((l) => l.code === stored) || LANGUAGES[0];

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(initial);

  const toggle = () => setOpen(!open);
  const pick = (lang) => {
    setSelected(lang);
    setOpen(false);
    if (onSelect) onSelect(lang.code);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="flex items-center text-white hover:opacity-90 transition text-sm font-medium"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected.label}
        <svg
          className="ml-1 h-4 w-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          role="listbox"
        >
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              onClick={() => pick(lang)}
              className={`px-4 py-2 text-gray-800 hover:bg-green-100 cursor-pointer transition ${
                lang.code === selected.code ? 'font-semibold' : ''
              }`}
              role="option"
              aria-selected={lang.code === selected.code}
            >
              {lang.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
