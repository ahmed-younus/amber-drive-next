import { redirect } from "next/navigation";

export default function ViewQuotePage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/quotes/${params.id}/preview`);
}
