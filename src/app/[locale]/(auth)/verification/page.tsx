import { StatusView } from "./status-view";

/**
 * KYC status (step 3 of 3). `?scenario=needs-info` demos the
 * "we need one more document" variant of the mock review.
 */
export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const { scenario } = await searchParams;
  return <StatusView scenario={scenario === "needs-info" ? "needs_info" : "pending"} />;
}
