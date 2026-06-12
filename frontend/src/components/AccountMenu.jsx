import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/initials";

export function AccountMenu() {
  const { doctor, logout } = useAuth();
  if (!doctor) return null;

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Avatar>
            <AvatarFallback>{initials(doctor.fullName)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[230px]">
        <div className="px-2.5 py-2">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">
            {doctor.fullName}
          </p>
          <p className="truncate text-xs text-[var(--muted)]">{doctor.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
