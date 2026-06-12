import { Brand } from "@/components/Brand";

// Centered card shell shared by the login and register screens.
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-10">
      <div className="w-full max-w-[420px]">
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 shadow-md sm:p-9">
          <Brand className="mb-7" />
          <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
            {title}
          </h1>
          <p className="mt-1 mb-6 text-sm text-[var(--muted)]">{subtitle}</p>
          {children}
        </div>
        {footer && (
          <p className="mt-5 text-center text-sm text-[var(--muted)]">{footer}</p>
        )}
      </div>
    </div>
  );
}
