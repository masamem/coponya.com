import { useState } from "react";
import { Pause, Play } from "lucide-react";
import stores from "@/lib/supermarketStores.json";
import "./SupermarketStores.css";

export default function SupermarketStores() {
  const [paused, setPaused] = useState(false);
  return (
    <section className="supermarket-stores section" aria-labelledby="supermarket-heading">
      <div className="container">
        <div className="section-heading">
          <div className="heading-copy">
            <span className="eyebrow">عروض التسوق اليومية</span>
            <h2 id="supermarket-heading">عروض المتاجر والسوبرماركت</h2>
            <p>تصفح أحدث العروض من متاجرك المفضلة عبر قوتي</p>
          </div>
          <button type="button" className="supermarket-pause" aria-pressed={paused}
            onClick={() => setPaused(!paused)} aria-label={paused ? "تشغيل حركة المتاجر" : "إيقاف حركة المتاجر مؤقتًا"}>
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
        <div className={`supermarket-window${paused ? " is-paused" : ""}`}>
          {[0, 1].map(row => (
            <div className={`supermarket-track${row ? " supermarket-track--reverse" : ""}`} key={row}>
              {[0, 1].map(copy => (
                <div className="supermarket-set" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                  {stores.filter((_, index) => index % 2 === row).map(store => (
                    <a className="supermarket-store" key={store.name} href={store.href}
                      target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : undefined}>
                      <span className="supermarket-logo"><img src={store.image} alt={store.name} width="108" height="108" loading="lazy" decoding="async" /></span>
                      <span className="supermarket-name">{store.name}</span>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <a className="supermarket-all text-link" href="https://qooty.net/en" target="_blank" rel="noopener noreferrer">جميع عروض المتاجر على قوتي ←</a>
      </div>
    </section>
  );
}
