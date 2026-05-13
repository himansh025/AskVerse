// src/components/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, size = 'medium', variant = 'primary', className = '', ...props }: ButtonProps) {
  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-5 py-2.5 text-sm',
    large: 'px-6 py-3 text-base',
  };

  const variants = {
    primary:
      'bg-[var(--color-accent)] text-white shadow-[0_18px_40px_rgba(179,78,104,0.28)] hover:-translate-y-0.5 hover:bg-[var(--color-accent-strong)] focus-visible:ring-[var(--color-accent)]',
    secondary:
      'border border-white/70 bg-white/85 text-[var(--color-ink)] shadow-[0_16px_36px_rgba(21,35,58,0.08)] hover:-translate-y-0.5 hover:bg-white focus-visible:ring-[var(--color-brand)]',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
