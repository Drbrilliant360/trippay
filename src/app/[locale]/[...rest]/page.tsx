import { notFound } from "next/navigation";

/** Catch-all: any path that no route matched renders the localized 404. */
export default function CatchAllPage() {
  notFound();
}
