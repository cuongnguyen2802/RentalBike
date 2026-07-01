"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelBooking } from "@/lib/booking/actions";
import { Loader2 } from "lucide-react";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Cancel booking?</span>
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await cancelBooking(bookingId);
              setConfirmed(false);
            });
          }}
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes, cancel"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmed(false)}>
          No
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setConfirmed(true)}>
      Cancel
    </Button>
  );
}
