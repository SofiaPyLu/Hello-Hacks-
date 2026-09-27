import { useRevalidator } from "react-router";
import { Icon } from "./icon";

export function BackendError({ error }: { error: unknown }) {
  const revalidator = useRevalidator();
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return (
    <section className="content-panel empty-state-panel">
      <span className="empty-state-icon"><Icon name="bell" /></span>
      <h3>Can't load your numbers</h3>
      <p>{message}</p>
      <button className="subtle-button" onClick={() => revalidator.revalidate()}>
        Try again
      </button>
    </section>
  );
}
