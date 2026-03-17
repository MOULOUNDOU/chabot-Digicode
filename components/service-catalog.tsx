import { BRAND_NAME } from "@/lib/contact";
import { DIGICODE_SERVICES } from "@/lib/services";

export function ServiceCatalog() {
  return (
    <section className="card-elevated rounded-3xl p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Nos services {BRAND_NAME}</h2>
      <p className="mt-1 text-sm text-slate-600">Offres claires, accompagnement pro et réponse rapide.</p>

      <div className="mt-4 space-y-3">
        {DIGICODE_SERVICES.map((service) => (
          <article key={service.key} className="rounded-2xl border border-slate-200 bg-white/80 p-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">{service.label}</h3>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                {service.priceLabel}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{service.details}</p>
            {service.highlights ? (
              <p className="mt-1 text-xs font-medium text-emerald-700">{service.highlights}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
