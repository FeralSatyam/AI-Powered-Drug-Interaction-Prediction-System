import { Toaster as Sonner } from "sonner";

// Toast host. Mounted once near the app root; call toast() from anywhere.
function Toaster(props) {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] shadow-lg",
          description: "text-[var(--muted)]",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-secondary text-secondary-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
