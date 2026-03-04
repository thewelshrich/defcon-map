type NewsTickerProps = {
  items: string[];
};

export function NewsTicker({ items }: NewsTickerProps) {
  return (
    <footer className="news-ticker" role="contentinfo">
      <div className="ticker-track">
        {items.map((item) => (
          <span key={item} className="ticker-item">
            {item}
          </span>
        ))}
      </div>
    </footer>
  );
}
