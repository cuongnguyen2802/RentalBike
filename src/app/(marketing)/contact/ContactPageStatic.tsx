"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, ArrowRight } from "lucide-react";

const stations = [
  { name: "District 1 — Ben Thanh",   address: "1 Le Loi, Ben Thanh Ward, District 1, Ho Chi Minh City",       phone: "+84 28 1234 5678", hours: "Mon–Fri 07:00–20:00 · Sat–Sun 08:00–18:00" },
  { name: "District 3 — Vo Thi Sau",  address: "45 Vo Thi Sau, District 3, Ho Chi Minh City",                  phone: "+84 28 9876 5432", hours: "Mon–Fri 07:30–19:30 · Sat–Sun 08:00–17:00" },
  { name: "Thu Duc City — Linh Xuan", address: "88 Nguyen Van Cu, Linh Xuan Ward, Thu Duc City",               phone: "",                 hours: "Mon–Sun 08:00–18:00" },
];

const faqs = [
  { q: "How do I change or cancel my booking?",       a: "Log into your account, go to My Bookings, and hit Cancel. Full refund if more than 24 hours before pickup." },
  { q: "What if I have a problem during my ride?",    a: "Call the emergency number printed on your booking confirmation. We have staff on call 7 days a week." },
  { q: "Can I return the bike to a different station?", a: "Currently bikes must be returned to the same station where they were picked up." },
  { q: "Do you offer corporate or group rates?",      a: "Yes! Email us at hello@pedalgo.com with your group size and dates and we'll put together a custom quote." },
];

export default function ContactPageStatic() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div>
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">Get in touch</p>
          <h1 className="text-4xl font-black text-gray-900 mb-4">We&apos;d love to hear from you</h1>
          <p className="text-gray-500 max-w-md mx-auto">Questions about a booking, feedback on your ride, or just want to say hi — we reply within a few hours.</p>
        </div>
      </section>
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg">Contact info</h2>
                {[
                  { icon: Mail,           label: "Email",          value: "hello@pedalgo.com", note: "We reply within 4 hours",     href: "mailto:hello@pedalgo.com" },
                  { icon: Phone,          label: "Phone",          value: "+84 28 1234 5678",  note: "7 days · 7am – 9pm",           href: "tel:+842812345678" },
                  { icon: MessageSquare,  label: "Zalo / WhatsApp", value: "+84 90 123 4567",  note: "Fastest for urgent issues",    href: undefined },
                ].map(({ icon: Icon, label, value, note, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors">{value}</a>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-5">Our Stations</h2>
                <div className="space-y-5">
                  {stations.map(s => (
                    <div key={s.name} className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.address}</p>
                        {s.phone && <p className="text-xs text-gray-500 mt-0.5">{s.phone}</p>}
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-gray-300" />
                          <p className="text-[11px] text-gray-400">{s.hours}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Link href="/stations" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                    View station map <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h3>
                    <p className="text-gray-500 mb-6">We&apos;ll get back to you at <strong>{form.email}</strong> within a few hours.</p>
                    <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-bold text-gray-900 text-lg mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["name", "email"].map(f => (
                          <div key={f}>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                              {f === "name" ? "Your name" : "Email address"}
                            </label>
                            <input type={f === "email" ? "email" : "text"} name={f}
                              value={(form as Record<string, string>)[f]} onChange={handleChange} required
                              placeholder={f === "name" ? "Nguyen Van A" : "you@example.com"}
                              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors" />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Subject</label>
                        <select name="subject" value={form.subject} onChange={handleChange} required
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white">
                          <option value="">Select a topic…</option>
                          <option value="booking">Booking question</option>
                          <option value="cancellation">Cancellation / refund</option>
                          <option value="damage">Bike damage / incident</option>
                          <option value="corporate">Corporate / group rental</option>
                          <option value="feedback">Feedback</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Message</label>
                        <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                          placeholder="Tell us what's on your mind…"
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none" />
                      </div>
                      <button type="submit" disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors">
                        {submitting
                          ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending…</>
                          : <><Send className="h-4 w-4" /> Send message</>
                        }
                      </button>
                    </form>
                  </>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="font-bold text-gray-900 text-lg mb-5">Common questions</h2>
                <div className="space-y-4">
                  {faqs.map(faq => (
                    <div key={faq.q} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1.5">{faq.q}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
