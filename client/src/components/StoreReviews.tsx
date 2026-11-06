import { useEffect, useState } from "react";
import { backendRequest, BackendError } from "@/lib/backend";
import { reviewRequest, statusLabels, reportLabels } from "@/lib/storeReviews";
import "./store-reviews.css";

type Review = { id: string; rating: number; comment: string; created_at: string };
const pageSize = 20;

export function StoreReviews({ storeId }: { storeId: string }) {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [token, setToken] = useState("");
  const [ownStatus, setOwnStatus] = useState<string | null>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [listing, setListing] = useState("loading");
  const [hasMore, setHasMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const [reporting, setReporting] = useState("");
  const [reported, setReported] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setListing("loading");
    reviewRequest<Review[]>("list_store_reviews", { p_store: storeId }, { signal: controller.signal })
      .then(rows => {
        if (controller.signal.aborted) return;
        setReviews(rows);
        setHasMore(rows.length === pageSize);
        setListing("ready");
      })
      .catch(() => { if (!controller.signal.aborted) setListing("error"); });
    return () => controller.abort();
  }, [storeId, revision]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await action();
    } catch (error) {
      if (error instanceof BackendError && error.status === 401) {
        setToken("");
        setCodeSent(false);
      }
      setNotice("تعذر تنفيذ الطلب. تحقق من البيانات وحاول مجدداً.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="content-panel store-reviews" aria-labelledby="store-reviews-title" dir="rtl">
    <h2 id="store-reviews-title">تقييمات المتجر</h2>
    {listing === "loading" && <p role="status">جارٍ تحميل التقييمات…</p>}
    {listing === "error" && <button className="button button--outline" onClick={() => setRevision(v => v + 1)}>تعذر تحميل التقييمات. إعادة المحاولة</button>}
    {listing === "ready" && reviews.length === 0 && <p>لا توجد تقييمات منشورة بعد.</p>}
    {listing === "ready" && reviews.map(review => <article className="store-review" key={review.id}>
      <strong aria-label={review.rating + " من ٥ نجوم"}><span aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></strong>
      <time dateTime={review.created_at}>{new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", calendar: "gregory", timeZone: "Asia/Riyadh" }).format(new Date(review.created_at))}</time>
      <p dir="auto">{review.comment}</p>
      {token && (reported.includes(review.id) ? <small>تم إرسال البلاغ.</small> : reporting === review.id ?
        <form className="support-form" onSubmit={event => {
          event.preventDefault();
          const reason = new FormData(event.currentTarget).get("reason");
          void run(async () => {
            const result = await reviewRequest<string>("report_store_review", { p_review: review.id, p_reason: reason }, { token });
            if (result === "rate_limited") return setNotice("بلغت حد البلاغات لهذه الساعة.");
            setReported(rows => [...rows, review.id]);
            setReporting("");
          });
        }}>
          <label>سبب البلاغ<select name="reason" required><option value="">اختر السبب</option>
            {Object.entries(reportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <div className="store-review-actions">
            <button className="button button--primary" disabled={busy}>إرسال البلاغ</button>
            <button type="button" className="button button--outline" disabled={busy} onClick={() => setReporting("")}>إلغاء</button>
          </div>
        </form> : <button className="button button--outline" disabled={busy} onClick={() => setReporting(review.id)}>الإبلاغ عن التقييم</button>)}
    </article>)}
    {listing === "ready" && hasMore && <button className="button button--outline" disabled={busy} onClick={() => void run(async () => {
      const rows = await reviewRequest<Review[]>("list_store_reviews", { p_store: storeId, p_offset: reviews.length });
      setReviews(current => [...current, ...rows.filter(row => !current.some(existing => existing.id === row.id))]);
      setHasMore(rows.length === pageSize);
    })}>عرض المزيد</button>}

    <p>شارك تجربتك مع المتجر. تجنب نشر معلومات الاتصال أو الروابط.</p>
    {!token ? <form className="support-form" onSubmit={event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      void run(async () => {
        if (!codeSent) {
          await backendRequest("/auth/v1/otp", { method: "POST", body: { email, create_user: true } });
          setCodeSent(true);
          setNotice("أرسلنا رمز الدخول إلى بريدك الإلكتروني.");
          return;
        }
        const session = await backendRequest<{ access_token: string }>("/auth/v1/verify", {
          method: "POST", body: { email, token: form.get("code"), type: "email" },
        });
        setToken(session.access_token);
        setCodeSent(false);
        setOwnStatus(undefined);
        setOwnStatus(await reviewRequest<string | null>("my_store_review", { p_store: storeId }, { token: session.access_token }));
      });
    }}>
      <label>البريد الإلكتروني<input type="email" dir="ltr" autoComplete="email" required value={email} readOnly={codeSent} onChange={event => setEmail(event.target.value)} /></label>
      {codeSent && <label>رمز الدخول<input name="code" dir="ltr" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" required /></label>}
      <div className="store-review-actions">
        <button className="button button--primary" disabled={busy}>{codeSent ? "تأكيد الرمز" : "إرسال رمز الدخول"}</button>
        {codeSent && <button type="button" className="button button--outline" disabled={busy} onClick={() => setCodeSent(false)}>تغيير البريد أو طلب رمز جديد</button>}
      </div>
    </form> : <>
      {ownStatus === undefined && <button className="button button--outline" disabled={busy} onClick={() => void run(async () => {
        setOwnStatus(await reviewRequest<string | null>("my_store_review", { p_store: storeId }, { token }));
      })}>تحميل حالة تقييمي</button>}
      {ownStatus && <p role="status">حالة تقييمك · {statusLabels[ownStatus]}</p>}
      {ownStatus === null && <form className="support-form" onSubmit={event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        void run(async () => {
          const comment = String(form.get("comment")).trim();
          if (comment.length < 10) return setNotice("اكتب تعليقاً من ١٠ أحرف على الأقل.");
          const status = await reviewRequest<string>("submit_store_review", {
            p_store: storeId, p_rating: Number(form.get("rating")), p_comment: comment,
          }, { token });
          if (status === "rate_limited") return setNotice("بلغت حد التقييمات لهذه الساعة.");
          setOwnStatus(status);
          setRevision(v => v + 1);
        });
      }}>
        <label>التقييم<select name="rating" required defaultValue=""><option value="">اختر عدد النجوم</option>
          {[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} من ٥</option>)}
        </select></label>
        <label>تعليقك<textarea name="comment" dir="auto" rows={4} required minLength={10} maxLength={2000} /></label>
        <button className="button button--primary" disabled={busy}>إرسال التقييم</button>
      </form>}
      <button className="button button--outline" disabled={busy} onClick={() => void run(async () => {
        try {
          await backendRequest("/auth/v1/logout?scope=local", { method: "POST", token });
        } finally {
          setToken("");
          setReported([]);
          setReporting("");
        }
      })}>تسجيل الخروج</button>
    </>}
    <p role="status" aria-live="polite">{notice}</p>
  </section>;
}
