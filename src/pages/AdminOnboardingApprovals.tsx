import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  listPendingOnboardingApplications,
  reviewOnboardingApplication,
} from "@/api/marketplaceApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const ADMIN_EMAILS = ["bernardofoegbu71@gmail.com"];

const AdminOnboardingApprovals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const isAllowed = useMemo(
    () => Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())),
    [user?.email]
  );

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await listPendingOnboardingApplications();
      setApplications(response);
    } catch (err: any) {
      toast({
        title: "Failed to load applications",
        description: err?.message ?? "Could not fetch onboarding applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAllowed) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [isAllowed]);

  const handleReview = async (
    applicationId: string,
    status: "approved" | "rejected"
  ) => {
    setReviewingId(applicationId);

    try {
      await reviewOnboardingApplication(
        applicationId,
        status,
        notesById[applicationId]
      );

      toast({
        title: `Application ${status}`,
        description: `Onboarding request has been ${status}.`,
      });

      await loadApplications();
    } catch (err: any) {
      toast({
        title: "Review failed",
        description: err?.message ?? "Could not review application.",
        variant: "destructive",
      });
    } finally {
      setReviewingId(null);
    }
  };

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Restricted</p>
          <h1 className="mt-2 text-3xl font-semibold">Hidden Admin</h1>
          <p className="mt-3 text-gray-400">You do not have access to onboarding approvals.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Admin Onboarding Approvals</h1>
        <p className="mt-2 text-gray-400">Review and approve pending laundry house and rider onboarding applications.</p>

        <div className="mt-6">
          <Button variant="outline" className="border-gray-600 text-gray-200" onClick={loadApplications}>
            Refresh Queue
          </Button>
        </div>

        {loading ? <p className="mt-6">Loading pending approvals...</p> : null}

        <div className="mt-6 grid gap-4">
          {applications.map((application) => (
            <Card key={application.id} className="border-gray-700 bg-gray-900 text-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{application.applicant_type === "laundry_house" ? "Laundry House" : "Rider"} Application</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-amber-300">
                    {application.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Application ID: {application.id}</p>
                <p>Applicant User ID: {application.applicant_user_id}</p>
                <pre className="overflow-x-auto rounded-md bg-black/40 p-3 text-xs text-gray-300">
                  {JSON.stringify(application.payload, null, 2)}
                </pre>

                <div>
                  <p className="mb-1">Admin Notes</p>
                  <Textarea
                    value={notesById[application.id] ?? ""}
                    onChange={(event) =>
                      setNotesById((existing) => ({
                        ...existing,
                        [application.id]: event.target.value,
                      }))
                    }
                    placeholder="Optional review note"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={reviewingId === application.id}
                    onClick={() => handleReview(application.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={reviewingId === application.id}
                    onClick={() => handleReview(application.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && !applications.length ? (
            <p className="text-gray-400">No pending onboarding applications.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminOnboardingApprovals;
