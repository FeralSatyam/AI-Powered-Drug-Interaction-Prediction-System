import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatients } from "@/context/PatientContext";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/utils";

export function PatientSwitcher() {
  const {
    patients,
    currentPatient,
    currentPatientId,
    selectPatient,
    addPatient,
    removePatient,
  } = usePatients();

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const patient = await addPatient(trimmed);
      toast.success(`${patient.name} added`);
      setName("");
      setAddOpen(false);
    } catch (err) {
      toast.error(err.message || "Could not add patient");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(patient, e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removePatient(patient.id);
      toast.success(`${patient.name} removed`);
    } catch (err) {
      toast.error(err.message || "Could not remove patient");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="max-w-[220px] justify-start gap-2 font-medium"
          >
            <UserRound className="size-4 text-[var(--muted)]" />
            <span className="truncate">
              {currentPatient ? currentPatient.name : "Select patient"}
            </span>
            <ChevronsUpDown className="ml-auto size-3.5 text-[var(--muted)]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[264px]">
          <DropdownMenuLabel>
            Patients
            <span className="ml-1 font-normal text-[var(--muted)]">
              · {patients.length}
            </span>
          </DropdownMenuLabel>

          {patients.length === 0 && (
            <p className="px-2.5 py-3 text-center text-xs text-[var(--muted)]">
              No patients yet
            </p>
          )}

          <div className="max-h-[280px] overflow-y-auto">
            {patients.map((patient) => {
              const selected = patient.id === currentPatientId;
              return (
                <DropdownMenuItem
                  key={patient.id}
                  onSelect={() => selectPatient(patient.id)}
                  className={cn(
                    "group",
                    selected && "bg-accent text-accent-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-primary"
                    )}
                  >
                    {initials(patient.name)}
                  </span>
                  <span className="truncate">{patient.name}</span>
                  {selected ? (
                    <Check className="ml-auto size-4 text-primary" />
                  ) : (
                    <button
                      type="button"
                      aria-label={`Remove ${patient.name}`}
                      onClick={(e) => handleRemove(patient, e)}
                      className="ml-auto hidden rounded p-1 text-[var(--muted)] hover:bg-destructive/10 hover:text-destructive group-hover:block"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setAddOpen(true);
            }}
            className="text-primary focus:text-primary"
          >
            <Plus className="size-4" />
            Add patient
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add patient</DialogTitle>
            <DialogDescription>
              Create a patient record to track their medications and analyses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="patient-name">Full name</Label>
              <Input
                id="patient-name"
                autoFocus
                placeholder="e.g. Anita Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Add patient
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
