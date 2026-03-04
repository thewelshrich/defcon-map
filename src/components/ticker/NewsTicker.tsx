import type { TickerItem } from "../../app/App";

type NewsTickerProps = {
  items: TickerItem[];
};

function categoryClass(category: TickerItem["category"]) {
  return `ticker-category ticker-category-${category}`;
}

export function NewsTicker({ items }: NewsTickerProps) {
  const doubled = [...items, ...items];

  return (
    <footer className="news-ticker" role="contentinfo">
      <div className="ticker-track">
        {doubled.map((item, index) => (
          <span key={`${item.id}-${index}`} className="ticker-item">
            <span className={categoryClass(item.category)}>{item.category.toUpperCase()}</span>
            {" \u2014 "}
            {item.text.split("\u2014")[1]?.trim() ?? item.text}
          </span>
        ))}
      </div>
    </footer>
  );
}
