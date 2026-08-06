import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Calendar, Package, Star, Phone, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UserAvatar } from "@/components/common/UserAvatar";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

// Loader: tries real API first, falls back to mock data if API unreachable
async function loadProfile(id) {
  try {
    const data = await api.get(`/users/${id}/profile`);
    return data?.data || null;
  } catch {
    // Fallback: تجربة mock data للتطوير المحلي
    const { findUserById } = await import("@/data/users");
    return findUserById(id) || null;
  }
}

export const Route = createFileRoute("/u/$id")({
  loader: ({ params }) => loadProfile(params.id),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name || "Profile"} — LapGenius` },
      { name: "description", content: `Public profile of ${loaderData?.name || "user"} on LapGenius.` },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const user = Route.useLoaderData();
  const { t } = useI18n();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 grid place-items-center px-4 py-20 text-center">
          <div>
            <p className="text-xl text-muted-foreground mb-6">{t("profile.notFound")}</p>
            <Link to="/" className="inline-flex h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold items-center">
              {t("checkout.backHome")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const typeLabel =
    user.role === "seller" ? t("profile.typeSeller") :
    user.role === "admin"  ? t("profile.typeAdmin") :
    t("profile.typeUser");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-3xl font-black mb-6">{t("profile.publicTitle")}</h1>
        <div className="rounded-3xl border bg-card shadow-soft p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <UserAvatar src={user.image} name={user.name} size="xl" />
            <div className="min-w-0">
              <div className="text-2xl font-black truncate">{user.name}</div>
              <div className="text-xs font-mono text-muted-foreground/60 mt-0.5">#{user.id}</div>
              <div className="mt-1 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <BadgeCheck className="size-3.5" /> {typeLabel}
              </div>
            </div>
          </div>

          {/* Info Rows */}
          <div className="mt-6 space-y-3">
            {user.email && (
              <InfoRow icon={Mail} label={t("auth.email")} value={user.email} />
            )}
            {user.phone && (
              <InfoRow icon={Phone} label={t("auth.phone")} value={user.phone} />
            )}
            {user.joined && (
              <InfoRow icon={Calendar} label={t("admin.joined")} value={user.joined} />
            )}
            <InfoRow icon={BadgeCheck} label={t("profile.accountType")} value={typeLabel} />

            {/* Extra seller info */}
            {user.role === "seller" && user.total_products !== undefined && (
              <InfoRow icon={Package} label={t("seller.totalProducts")} value={String(user.total_products)} />
            )}
            {user.role === "seller" && user.rating !== undefined && (
              <InfoRow icon={Star} label="Rating" value={`${user.rating} / 5`} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border bg-background/40">
      <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold">{label}</div>
        <div className="font-semibold break-all">{value}</div>
      </div>
    </div>
  );
}
