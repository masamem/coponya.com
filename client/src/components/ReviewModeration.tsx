import { useEffect, useState } from "react";
import { reviewRequest, statusLabels, reportLabels } from "@/lib/storeReviews";
import "./store-reviews.css";

type QueueItem = {
  id: string; store_name: string; rating: number; comment: string; status: string;
  flags: string[]; reports: string[]; report_count: number;
};

const flagLabels: Record<string, string> = {
  external_link: "رابط خارجي",
  personal_contact: "بيانات اتصال",
  repeated_text: "نص متكرر",
  potential_threat: "تهديد محتمل",
  potential_allegation: "اتهام محتمل",
};

export function ReviewModeration({ token }: { token: string }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setFailed(false);
    reviewRequest<QueueItem[]>("store_review_queue", {}, { token, signal: controller.signal })
      .then(rows => { if (!controller.signal.aborted) setItems(rows); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [token, revision]);

  async function decide(item: QueueItem, status: string) {
    setBusy(true);
    setNotice("");
    try {
      const saved = await reviewRequest<boolean>("moderate_store_review", {
        p_review: item.id, p_expected: item.status, p_report_count: item.report_count, p_status: status,
      }, { token });
      setNotice(saved ? "تم حفظ القرار." : "تغيرت حالة التقييم أو وصل بلاغ جديد. راجع القائمة مجدداً.");
      setRevision(v => v + 1);
    } catch {
      setNotice("تعذر حفظ القرار. تحقق من الاتصال وصلاحية الجلسة.");
      setBusy(false);
    }
  }

  return <section className="content-panel store-reviews" aria-labelledby="moderation-title">
    <h2 id="moderation-title">مراجعة التقييمات والبلاغات</h2>
    <button className="button button--outline" disabled={busy} onClick={() => setRevision(v => v + 1)}>تحديث القائمة</button>
    {busy && <p role="status">جارٍ تنفيذ الطلب…</p>}
    {failed && <p role="alert">تعذر تحميل القائمة. تحقق من الاتصال وصلاحية الجلسة.</p>}
    {!busy && !failed && items.length === 0 && <p>لا توجد تقييمات أو بلاغات بانتظار المراجعة.</p>}
    {!failed && items.map(item => <article className="store-review" key={item.id}>
      <h3>{item.store_name} · {item.rating}/5</h3>
      <small>{statusLabels[item.status]}</small>
      <p dir="auto">{item.comment}</p>
      {item.flags.length > 0 && <p>أسباب الفحص · {item.flags.map(flag => flagLabels[flag] ?? flag).join("، ")}</p>}
      {item.report_count > 0 && <p>البلاغات ({item.report_count}) · {item.reports.map(reason => reportLabels[reason]).join("، ")}</p>}
      <div className="store-review-actions">
        <button className="button button--primary" disabled={busy} onClick={() => void decide(item, "published")}>{item.status === "published" ? "إبقاء التقييم منشوراً" : "نشر التقييم"}</button>
        <button className="button button--outline" disabled={busy} onClick={() => void decide(item, "rejected")}>{item.status === "published" ? "إخفاء التقييم" : "رفض التقييم"}</button>
      </div>
    </article>)}
    <p role="status">{notice}</p>
  </section>;
}
