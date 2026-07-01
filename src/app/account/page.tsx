import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, UserCircle2 } from "lucide-react";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <UserCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{dbUser?.name ?? user.email}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {dbUser?.phone && <p className="text-gray-500 text-sm">{dbUser.phone}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Link
          href="/account/bookings"
          className="rounded-2xl border border-gray-100 bg-white p-5 flex items-center justify-between hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">My Bookings</p>
              <p className="text-sm text-gray-500">
                {dbUser?._count.bookings ?? 0} total bookings
              </p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </Link>
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild>
          <Link href="/bikes">Browse More Bikes</Link>
        </Button>
      </div>
    </div>
  );
}
