import { AppShell } from "../components/AppShell";
import { Topbar } from "../components/Topbar";

export default function Billing() {
  return (
    <AppShell>
      <Topbar title="Billing" />
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="card p-6">
          <span className="text-[10px] uppercase font-mono text-cyan border border-cyan/30 rounded-full px-2 py-0.5">
            Free plan
          </span>
          <h2 className="font-display font-semibold text-lg mt-3">No billing connected yet</h2>
          <p className="text-sm text-ash-500 mt-2 leading-relaxed">
            This is a placeholder — plug in Stripe or Paystack here to add paid tiers (e.g. higher AI
            generation limits, private projects, team seats). The backend already rate-limits AI calls
            per user, so metering usage per plan is a natural next step.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
