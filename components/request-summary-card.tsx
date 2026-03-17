import { ClipboardCopy, CheckCircle2, CircleAlert, MessageCircle } from "lucide-react";
import { buildLeadSummary } from "@/lib/lead";
import { getServicePriceLabel, SERVICE_BY_KEY } from "@/lib/services";
import { LeadData } from "@/types/chat";

interface RequestSummaryCardProps {
  lead: LeadData;
  summary: string;
  missingFields: string[];
  whatsappLink: string;
  hasWhatsappNumber: boolean;
  copied: boolean;
  onCopySummary: () => void;
}

export function RequestSummaryCard({
  lead,
  summary,
  missingFields,
  whatsappLink,
  hasWhatsappNumber,
  copied,
  onCopySummary,
}: RequestSummaryCardProps) {
  const serviceLabel = lead.service ? SERVICE_BY_KEY[lead.service].label : "À préciser";
  const finalSummary = summary || buildLeadSummary(lead);
  const canSubmit = missingFields.length === 0 && Boolean(whatsappLink) && hasWhatsappNumber;

  return (
    <section className="card-elevated rounded-3xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Récapitulatif de votre demande</h2>
          <p className="text-xs text-slate-600">Vérifiez les détails avant envoi sur WhatsApp.</p>
        </div>
        {canSubmit ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 size={13} />
            Prêt
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
            <CircleAlert size={13} />
            Incomplet
          </span>
        )}
      </div>

      <dl className="mt-4 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-2">
          <dt className="font-semibold text-slate-500">Nom</dt>
          <dd>{lead.clientName || "Non renseigné"}</dd>
        </div>
        <div className="rounded-xl bg-white p-2">
          <dt className="font-semibold text-slate-500">WhatsApp</dt>
          <dd>{lead.clientWhatsapp || "Non renseigné"}</dd>
        </div>
        <div className="rounded-xl bg-white p-2">
          <dt className="font-semibold text-slate-500">Service</dt>
          <dd>{serviceLabel}</dd>
        </div>
        <div className="rounded-xl bg-white p-2">
          <dt className="font-semibold text-slate-500">Prix indiqué</dt>
          <dd>{getServicePriceLabel(lead.service)}</dd>
        </div>
      </dl>

      {missingFields.length > 0 ? (
        <p className="mt-3 text-xs text-amber-700">Informations manquantes: {missingFields.join(", ")}</p>
      ) : (
        <p className="mt-3 text-xs text-emerald-700">Toutes les informations minimales sont prêtes pour soumission.</p>
      )}

      {!hasWhatsappNumber ? (
        <p className="mt-2 text-xs text-rose-700">
          Variable manquante: ajoutez `NEXT_PUBLIC_WHATSAPP_NUMBER` dans votre `.env.local`.
        </p>
      ) : null}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Résumé final</p>
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{finalSummary}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onCopySummary}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          <ClipboardCopy size={14} />
          {copied ? "Résumé copié" : "Copier le résumé"}
        </button>

        <a
          href={canSubmit ? whatsappLink : "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (!canSubmit) {
              event.preventDefault();
            }
          }}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
            canSubmit
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "cursor-not-allowed bg-slate-300 text-slate-600"
          }`}
          aria-disabled={!canSubmit}
        >
          <MessageCircle size={15} />
          Soumettre la demande sur WhatsApp
        </a>
      </div>
    </section>
  );
}
