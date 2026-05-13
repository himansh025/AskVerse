// src/components/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`shell-surface card-hover rounded-[28px] p-6 ${className}`}>
      {children}
    </div>
  );
}
