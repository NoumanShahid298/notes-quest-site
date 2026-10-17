import { Star } from 'lucide-react';

export function StarRating({ value, onChange, id, error }: { value: number; onChange?: (v: number) => void; id: string; error?: string }) {
  if (!onChange) return <span className="star-row" aria-label={`${value} out of 5 stars`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} size={15} className={n <= value ? 'star on' : 'star'} aria-hidden="true" />)}</span>;
  return (
    <div role="radiogroup" id={id} aria-label="Rating" aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className="star-row">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className="star-btn" onClick={() => onChange(n)}>
          <Star size={26} className={n <= value ? 'star on' : 'star'} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
