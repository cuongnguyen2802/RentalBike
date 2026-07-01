"use client";

import { useState } from "react";
import { Send, CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import type { ContactFormData } from "@/app/admin/pages/builder/types";

export default function ContactFormClient({ data }: { data: ContactFormData }) {
  const [form,       setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted,  setSubmitted]  = useState(false);
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        {(data.title || data.subtitle) && (
          <div className="text-center mb-12">
            {data.title    && <h2 className="text-3xl font-bold text-gray-900 mb-3">{data.title}</h2>}
            {data.subtitle && <p className="text-gray-500 max-w-md mx-auto">{data.subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Info column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h3 className="font-bold text-gray-900">Contact info</h3>
              {data.email && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                    <a href={`mailto:${data.email}`} className="text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                      {data.email}
                    </a>
                  </div>
                </div>
              )}
              {data.phone && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
                    <a href={`tel:${data.phone}`} className="text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                      {data.phone}
                    </a>
                  </div>
                </div>
              )}
              {data.address && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Address</p>
                    <p className="text-sm font-semibold text-gray-900">{data.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Form column */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h3>
                  <p className="text-gray-500 mb-6">We&apos;ll get back to you at <strong>{form.email}</strong> within a few hours.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 text-lg mb-6">Send us a message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {["name", "email"].map(field => (
                        <div key={field}>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            {field === "name" ? "Your name" : "Email address"}
                          </label>
                          <input
                            type={field === "email" ? "email" : "text"}
                            name={field}
                            value={(form as Record<string, string>)[field]}
                            onChange={handleChange}
                            required
                            placeholder={field === "name" ? "Nguyen Van A" : "you@example.com"}
                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
                          />
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
          </div>
        </div>
      </div>
    </section>
  );
}
