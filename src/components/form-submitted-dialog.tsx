import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/hooks/store";
import { CheckCircle, Repeat, X } from "lucide-react";

export function AlertDialog({
  title,
  description,
  btnName,
  btnAction,
  data,
}: {
  title?: string;
  description?: string;
  btnName?: string;
  btnAction?: () => void;
  data?: Record<string, string>;
}) {
  const { formSubmitted, setFormSubmitted } = useAppStore();

  return (
    <>
      <Dialog open={formSubmitted} onOpenChange={setFormSubmitted}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="">{title || "Alert Title"}</DialogTitle>
            <DialogDescription className="flex items-center text-green-800">
              <CheckCircle className="me-1" />{" "}
              {description || "Description for alert."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <pre>{JSON.stringify(data, null, 4)}</pre>
          </div>
          <DialogFooter>
            <Button type="button" variant={"outline"} onClick={btnAction}>
              <Repeat /> {btnName || "Submit"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setFormSubmitted(false);
                // navigate("/thankyou");
              }}
            >
              <X />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
