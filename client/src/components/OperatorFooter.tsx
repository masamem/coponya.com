import { operator } from "@/lib/legal";

/** Registration details required by the E-Commerce Law; renders nothing until they are filled in lib/legal.ts. */
export default function OperatorFooter() {
  const items = [
    operator.legalName,
    operator.commercialRegistration && `سجل تجاري ${operator.commercialRegistration}`,
    operator.freelanceDocument && `وثيقة عمل حر ${operator.freelanceDocument}`,
    operator.vatNumber && `الرقم الضريبي ${operator.vatNumber}`,
  ].filter(Boolean);
  if (!items.length && !operator.businessCenterCertificate) return null;
  return (
    <p className="operator-footer">
      {items.join(" · ")}
      {operator.businessCenterCertificate && <>{items.length ? " · " : ""}{operator.businessCenterUrl
        ? <a href={operator.businessCenterUrl} target="_blank" rel="noopener noreferrer">موثّق في المركز السعودي للأعمال ({operator.businessCenterCertificate})</a>
        : <>موثّق في المركز السعودي للأعمال ({operator.businessCenterCertificate})</>}</>}
    </p>
  );
}
