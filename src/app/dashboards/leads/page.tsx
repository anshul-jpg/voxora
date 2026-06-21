"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Mail, 
  Building, 
  Phone, 
  MessageSquare, 
  X, 
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Contact {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── CSV export & Sanitize ───────────────────────────────────────────────────
function sanitizeCSVField(value: string) {
  let val = (value ?? "").trim();
  // CSV Injection prevention (Formula Injection)
  if (/^[=\+\-@]/.test(val)) {
    val = `'${val}`;
  }
  if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
    val = `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function exportCSVLeads(contacts: Contact[], searchKeyword: string) {
  const header = ["Name", "Email", "Company", "Phone", "Message", "Date Captured"];
  const rows = contacts.map((c) => [
    sanitizeCSVField(c.name),
    sanitizeCSVField(c.email),
    sanitizeCSVField(c.company ?? ""),
    sanitizeCSVField(c.phone ?? ""),
    sanitizeCSVField(c.message ?? ""),
    sanitizeCSVField(new Date(c.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })),
  ]);

  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = searchKeyword 
    ? `voxora-leads-${searchKeyword.replace(/\s/g, "-")}-${dateStr}.csv`
    : `voxora-leads-all-${dateStr}.csv`;
    
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  
  // UI States
  const [selectedLead, setSelectedLead] = useState<Contact | null>(null);
  const [exporting, setExporting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search change
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch leads function
  const fetchLeads = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: debouncedSearch,
      });

      const res = await fetch(`/api/dashboard/contacts?${query.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load leads (Status ${res.status})`);
      }

      const data = await res.json();
      setContacts(data.contacts ?? []);
      setPagination(data.pagination ?? { total: 0, page: 1, limit: 20, pages: 1 });
    } catch (err: unknown) {
      console.error("Error fetching leads:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while loading leads.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  // Export CSV handler
  const handleExportCSV = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      // Fetch matching leads up to 10k limit
      const query = new URLSearchParams({
        page: "1",
        limit: "10000",
        search: debouncedSearch,
      });

      const res = await fetch(`/api/dashboard/contacts?${query.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      
      if (data.contacts && data.contacts.length > 0) {
        exportCSVLeads(data.contacts, debouncedSearch);
      } else {
        alert("No leads found to export.");
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export leads. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const formatDateFull = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:p-10 pb-24 max-w-[1100px] w-full mx-auto font-sans text-foreground">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5">
            Admin Management
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Landing Leads
            </h1>
            <span className="text-xs font-semibold bg-muted border border-border px-2 py-0.5 rounded-full text-muted-foreground">
              {pagination.total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse, search, and export prospective clients captured on the landing page.
          </p>
        </div>

        <button
          onClick={() => fetchLeads(true)}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto bg-muted border border-border hover:bg-accent text-foreground text-xs sm:text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors duration-150"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Filters & Action Bar ── */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search leads by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right actions: limit selector & CSV export */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Per Page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-card border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-ring transition-colors cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={exporting || loading || contacts.length === 0}
            className="flex items-center gap-2 bg-foreground text-background border-none hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-opacity duration-150"
          >
            <Download size={14} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* ── Leads Data Display ── */}
      {error ? (
        <div className="bg-card border border-destructive rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Unable to load Leads
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {error}
            </p>
          </div>
          <button
            onClick={() => fetchLeads(true)}
            className="bg-foreground text-background border-none rounded-lg px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer hover:opacity-90 font-sans"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="bg-card border border-border rounded-xl p-20 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
          <span className="text-xs sm:text-sm text-muted-foreground">Fetching leads data…</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <p className="text-sm sm:text-base font-semibold text-foreground mb-1.5">
            No leads found
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {debouncedSearch 
              ? "Try adjusting your search terms or keywords." 
              : "Leads captured via the contact form will show up here."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Table Container */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-4 sm:px-6 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Name / Info
                    </th>
                    <th className="p-4 sm:px-6 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Company
                    </th>
                    <th className="p-4 sm:px-6 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Contact Details
                    </th>
                    <th className="p-4 sm:px-6 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Message Info
                    </th>
                    <th className="p-4 sm:px-6 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Captured Date
                    </th>
                    <th className="p-4 sm:px-6 text-right text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {contacts.map((lead) => (
                    <tr 
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-muted/40 cursor-pointer transition-colors duration-100"
                    >
                      {/* Name */}
                      <td className="p-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground flex-shrink-0">
                            {(lead.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                              {lead.name}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ID: {lead._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="p-4 sm:px-6 text-xs text-foreground">
                        {lead.company ? (
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Building size={12} className="text-muted-foreground" />
                            {lead.company}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Contact Details */}
                      <td className="p-4 sm:px-6 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-foreground truncate">
                            <Mail size={12} className="text-muted-foreground flex-shrink-0" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone size={12} className="flex-shrink-0" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Message Info */}
                      <td className="p-4 sm:px-6 text-xs">
                        {lead.message ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-foreground/5 border border-border text-[11px] font-medium text-foreground">
                            <MessageSquare size={10} className="text-muted-foreground" />
                            Has Message
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-[11px]">No message</span>
                        )}
                      </td>

                      {/* Captured Date */}
                      <td className="p-4 sm:px-6 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="bg-transparent border border-border hover:border-ring text-muted-foreground hover:text-foreground p-1.5 rounded-lg cursor-pointer transition-all duration-150 inline-flex items-center justify-center"
                          title="View Details"
                        >
                          <Info size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination controls ── */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 px-1">
              <span className="text-xs text-muted-foreground">
                Showing Page <strong className="text-foreground">{pagination.page}</strong> of <strong className="text-foreground">{pagination.pages}</strong> ({pagination.total} leads)
              </span>

              <div className="flex items-center gap-1.5">
                {/* Prev page */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed p-2 rounded-lg cursor-pointer transition-colors duration-150 inline-flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pagination.pages)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <div key={p} className="flex items-center">
                        {showEllipsis && <span className="text-xs text-muted-foreground px-1.5">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`min-w-[32px] h-8 text-xs font-semibold rounded-lg cursor-pointer transition-colors duration-150 flex items-center justify-center ${
                            page === p
                              ? "bg-foreground text-background font-bold border-none"
                              : "bg-card border border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    );
                  })}

                {/* Next page */}
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed p-2 rounded-lg cursor-pointer transition-colors duration-150 inline-flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Lead Detail Modal Drawer ── */}
      <AnimatePresence>
        {selectedLead && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 top-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 max-w-lg w-full bg-card border border-border rounded-2xl z-50 p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-sans"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-semibold text-foreground">
                    {selectedLead.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground leading-tight">
                      {selectedLead.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Captured on {formatDateFull(selectedLead.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none p-1.5 rounded-lg border border-transparent hover:border-border hover:bg-muted transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                {/* Details Section */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="bg-muted/40 border border-border/60 rounded-xl p-3.5 flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Email Address
                    </span>
                    <span className="text-xs text-foreground font-medium break-all select-all flex items-center gap-1.5 mt-0.5">
                      <Mail size={12} className="text-muted-foreground flex-shrink-0" />
                      {selectedLead.email}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="bg-muted/40 border border-border/60 rounded-xl p-3.5 flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Phone Number
                    </span>
                    <span className="text-xs text-foreground font-medium select-all flex items-center gap-1.5 mt-0.5">
                      <Phone size={12} className="text-muted-foreground flex-shrink-0" />
                      {selectedLead.phone || <span className="text-muted-foreground/50 italic font-normal">Not Provided</span>}
                    </span>
                  </div>

                  {/* Company */}
                  <div className="col-span-2 bg-muted/40 border border-border/60 rounded-xl p-3.5 flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Company / Organization
                    </span>
                    <span className="text-xs text-foreground font-medium flex items-center gap-1.5 mt-0.5">
                      <Building size={12} className="text-muted-foreground flex-shrink-0" />
                      {selectedLead.company || <span className="text-muted-foreground/50 italic font-normal">Not Provided</span>}
                    </span>
                  </div>
                </div>

                {/* Message Section */}
                <div className="bg-muted/40 border border-border/60 rounded-xl p-4 flex flex-col">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageSquare size={11} />
                    Message Content
                  </span>
                  <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap select-text bg-background/50 border border-border/40 p-3 rounded-lg min-h-[80px]">
                    {selectedLead.message ? (
                      selectedLead.message
                    ) : (
                      <span className="text-muted-foreground/40 italic">This lead did not write a message.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border mt-5 flex items-center justify-between gap-3">
                <span className="text-[10px] text-muted-foreground font-mono">
                  Ref ID: {selectedLead._id}
                </span>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="bg-muted border border-border hover:bg-accent text-foreground text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors duration-150 font-sans"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
