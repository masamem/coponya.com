import { useState } from "react";
export function StoreLogo({initial,tone="olive",logoUrl,className=""}: {initial:string;tone?:string;logoUrl?:string;className?:string}) {
  const [failedUrl,setFailedUrl]=useState("");
  return <span className={`store-logo store-logo--${tone} ${className}`} aria-hidden="true">{logoUrl&&failedUrl!==logoUrl?<img src={logoUrl} alt="" loading="lazy" width={64} height={64} decoding="async" referrerPolicy="no-referrer" onError={()=>setFailedUrl(logoUrl)}/>:initial}</span>;
}
