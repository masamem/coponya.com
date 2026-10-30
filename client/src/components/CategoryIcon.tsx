const categoryPositions: Record<string, number> = {
  "أزياء": 0,
  "إلكترونيات": 1,
  "توصيل الطعام": 2,
  "السفر": 3,
  "الجمال والعناية": 4,
  "المنزل": 5,
  "الأطفال": 6,
  "الرياضة": 7,
};

/** Decorative artwork: the adjacent category name supplies the accessible label. */
export function CategoryIcon({ name }: { name: string }) {
  const position = categoryPositions[name];
  if (position === undefined) return null;
  return (
    <span className="category-icon category-icon--3d" aria-hidden="true">
      <span
        className="category-icon__art"
        style={{
          backgroundPosition: `${(position % 4) * (100 / 3)}% ${position < 4 ? 0 : 100}%`,
        }}
      />
    </span>
  );
}
