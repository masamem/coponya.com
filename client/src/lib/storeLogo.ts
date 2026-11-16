import { backendConfigured, backendUrl, BackendError } from "./backend";
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export function validateLogo(file: Pick<File,"type"|"size">) {
  if (!["image/png","image/jpeg","image/webp"].includes(file.type)) throw new Error("اختر صورة PNG أو JPG أو WebP.");
  if (!file.size || file.size > MAX_LOGO_BYTES) throw new Error("حجم الشعار يجب أن يكون أقل من أو يساوي 2 ميجابايت.");
}
export async function uploadStoreLogo(file: File, token: string) {
  if (!backendConfigured || !token) throw new Error("سجل الدخول لرفع شعار المتجر.");
  validateLogo(file);
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error("تعذر قراءة الصورة. اختر ملف صورة صالحاً."); }
  if (!bitmap.width || !bitmap.height || bitmap.width*bitmap.height>40000000) { bitmap.close(); throw new Error("أبعاد الصورة كبيرة جداً. اختر شعاراً أصغر."); }
  const ratio = Math.min(1, 512 / Math.max(bitmap.width,bitmap.height));
  const canvas = document.createElement("canvas"); canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
  const context=canvas.getContext("2d");if(!context){bitmap.close();throw new Error("تعذر تجهيز الصورة.");}context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const blob = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("تعذر تجهيز الصورة.")),"image/png"));
  const path=`${crypto.randomUUID()}.png`;
  const form=new FormData();form.append("cacheControl","3600");form.append("",blob,path);
  const publicKey=process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
  const response=await fetch(`${backendUrl}/storage/v1/object/store-logos/${path}`,{method:"POST",headers:{apikey:publicKey,Authorization:`Bearer ${token}`,"x-upsert":"false"},body:form});
  if(!response.ok){if(response.status===401)throw new BackendError("انتهت الجلسة. سجل الدخول مجدداً.",401);throw new Error("تعذر رفع الشعار. تحقق من الاتصال وصلاحية الإدارة.");}
  return `${backendUrl}/storage/v1/object/public/store-logos/${path}`;
}
