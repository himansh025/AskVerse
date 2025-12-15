// src/components/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white shadow-xl rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}