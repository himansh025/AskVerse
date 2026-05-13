// src/components/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3.5 text-slate-800 shadow-[0_16px_36px_rgba(21,35,58,0.06)] outline-none transition-all placeholder:text-slate-400 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[rgba(22,93,134,0.12)] ${className}`}
      {...props}
    />
  );
}
