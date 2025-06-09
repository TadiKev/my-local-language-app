// src/components/Card.jsx
export default function Card({ children, accent = "border-green-500" }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${accent}`}>
      {children}
    </div>
  );
}
