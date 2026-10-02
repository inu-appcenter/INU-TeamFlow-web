interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border-[0.8] border-[#D6DDE5] bg-white ${className} `}
    >
      {children}
    </div>
  );
}
