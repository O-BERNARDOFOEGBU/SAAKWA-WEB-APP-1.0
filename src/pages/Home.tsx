import { Building2, Bike, ShieldCheck, Sparkles, Clock3, Route } from "lucide-react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#dbeafe_0%,#fef3c7_35%,#fee2e2_70%,#e0e7ff_100%)]">
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(37,99,235,0.08),rgba(16,185,129,0.08),rgba(244,114,182,0.1))]" />
        <div className="container relative mx-auto grid gap-8 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div className="space-y-5">
            <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Saakwa Marketplace in Lekki
            </p>
            <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Laundry Pickup and Delivery, now powered by a three-sided network.
            </h1>
            <p className="max-w-xl text-lg text-slate-700">
              Users compare top laundry houses, riders handle doorstep logistics, and laundry partners process orders end-to-end with live tracking.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                to="/marketplace/laundries"
              >
                Compare Laundry Houses
              </Link>
              <Link
                className="rounded-md bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700"
                to="/marketplace/onboarding/laundry-house"
              >
                List a Laundry House
              </Link>
              <Link
                className="rounded-md bg-fuchsia-600 px-6 py-3 text-white transition-colors hover:bg-fuchsia-700"
                to="/marketplace/onboarding/rider"
              >
                Become a Rider
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-3 shadow-xl backdrop-blur">
            <img
              src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1200&q=80"
              alt="Woman joyfully checking freshly cleaned clothes"
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900">Built for Users, Laundry Houses, and Riders</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-200 bg-white/80 p-6 shadow-sm">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Users</h3>
              <p className="mt-2 text-slate-700">
                Compare laundry houses by service price, ratings, turnaround, and distance before booking pickup and delivery.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Laundry Houses</h3>
              <p className="mt-2 text-slate-700">
                Onboard your business, add service listings, accept or auto-confirm orders, and update to RECEIVED, PROCESSING, READY.
              </p>
            </div>

            <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-6 shadow-sm">
              <Bike className="h-8 w-8 text-fuchsia-600" />
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Riders</h3>
              <p className="mt-2 text-slate-700">
                Onboard with your location and receive only nearby assignments. Rider matching is limited to orders within 5km.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
              <Route className="h-7 w-7" />
              <h3 className="mt-3 text-xl font-semibold">Live Movement Tracking</h3>
              <p className="mt-2 text-blue-100">
                Users receive realtime rider coordinates and order state updates from pickup to delivery.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-500 p-6 text-white shadow-lg">
              <Clock3 className="h-7 w-7" />
              <h3 className="mt-3 text-xl font-semibold">Faster Operations</h3>
              <p className="mt-2 text-amber-100">
                Laundry dashboards streamline intake and processing states while riders update delivery milestones.
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg">
              <ShieldCheck className="h-7 w-7" />
              <h3 className="mt-3 text-xl font-semibold">Approval Controlled</h3>
              <p className="mt-2 text-indigo-100">
                Hidden admin workflow validates and approves rider and laundry onboarding before they go live.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/85 px-5 py-4 text-sm text-slate-600">
            <p>Saakwa marketplace is live across Lekki, Lagos.</p>
            <div className="flex gap-3">
              <Link className="text-blue-700 hover:underline" to="/checkout">
                Classic Checkout
              </Link>
              <Link className="text-blue-700 hover:underline" to="/marketplace/laundries">
                Marketplace
              </Link>
              <Link className="text-slate-400 hover:text-slate-500" to="/_saakwa/internal/admin-onboarding-approvals">
                .
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
