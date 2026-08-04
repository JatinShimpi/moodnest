import { useState } from "react";
import { Dialog } from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export function PromptDialog({
  open,
  title,
  placeholder,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  placeholder: string;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!value.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(value.trim());
      setValue("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => { setValue(""); onClose(); }} title={title}>
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => { setValue(""); onClose(); }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!value.trim() || submitting}>
          Create
        </Button>
      </div>
    </Dialog>
  );
}
