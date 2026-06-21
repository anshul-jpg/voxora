"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Users, 
  PhoneCall, 
  DollarSign, 
  Percent, 
  RefreshCw,
  Info
} from "lucide-react";

interface Contact {
  _id: string;
  createdAt: string;
}

interface Appointment {
  _id: string;
  createdAt: string;
  cost?: string;
}

type Timeframe = "week" | "month" | "all";

export default function AnalyticsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("week");
  
  // Interactive chart state
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Fetch all contacts and appointments
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      // Query up to 10k to calculate full analytics
      const [contactsRes, appointmentsRes] = await Promise.all([
        fetch("/api/dashboard/contacts?limit=10000", { credentials: "include" }),
        fetch("/api/dashboard/appointments?limit=10000", { credentials: "include" }),
      ]);

      if (!contactsRes.ok) {
        throw new Error(`Failed to load leads data (Status ${contactsRes.status})`);
      }
      if (!appointmentsRes.ok) {
        throw new Error(`Failed to load appointments data (Status ${appointmentsRes.status})`);
      }

      const [contactsData, appointmentsData] = await Promise.all([
        contactsRes.json(),
        appointmentsRes.json(),
      ]);

      setContacts(contactsData.contacts ?? []);
      setAppointments(appointmentsData.appointments ?? []);
    } catch (err: unknown) {
      console.error("Analytics fetch error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while loading analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Date filtering logic based on timeframe
  const filteredData = useMemo(() => {
    const now = new Date();
    
    // Time ranges
    let startDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    if (timeframe === "week") {
      // Current week (Monday to Sunday)
      const day = now.getDay();
      const diffToMon = (day === 0 ? -6 : 1 - day);
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMon);
      monday.setHours(0, 0, 0, 0);
      
      startDate = monday;
      
      // Previous week bounds
      const prevMonday = new Date(monday);
      prevMonday.setDate(monday.getDate() - 7);
      
      const prevSunday = new Date(monday);
      prevSunday.setDate(monday.getDate() - 1);
      prevSunday.setHours(23, 59, 59, 999);
      
      prevStartDate = prevMonday;
      prevEndDate = prevSunday;
    } else if (timeframe === "month") {
      // Last 30 days
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      startDate = thirtyDaysAgo;

      // Previous 30 days (days 31 to 60 ago)
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(now.getDate() - 60);
      sixtyDaysAgo.setHours(0, 0, 0, 0);
      
      prevStartDate = sixtyDaysAgo;
      prevEndDate = new Date(thirtyDaysAgo);
      prevEndDate.setMilliseconds(prevEndDate.getMilliseconds() - 1);
    } else {
      // All Time
      startDate = new Date(0); // Epoch start
      prevStartDate = new Date(0);
      prevEndDate = new Date(0);
    }

    const currentContacts = contacts.filter((c) => new Date(c.createdAt) >= startDate);
    const prevContacts = contacts.filter(
      (c) => {
        const d = new Date(c.createdAt);
        return d >= prevStartDate && d <= prevEndDate;
      }
    );

    const currentAppts = appointments.filter((a) => new Date(a.createdAt) >= startDate);
    const prevAppts = appointments.filter(
      (a) => {
        const d = new Date(a.createdAt);
        return d >= prevStartDate && d <= prevEndDate;
      }
    );

    return {
      currentContacts,
      prevContacts,
      currentAppts,
      prevAppts,
      startDate,
    };
  }, [contacts, appointments, timeframe]);

  // Metric summaries
  const metrics = useMemo(() => {
    const { currentContacts, prevContacts, currentAppts, prevAppts } = filteredData;

    const leadsCount = currentContacts.length;
    const prevLeadsCount = prevContacts.length;

    const apptsCount = currentAppts.length;
    const prevApptsCount = prevAppts.length;

    // Estimate revenue ($400 per booking)
    const revenue = currentAppts.reduce((sum, a) => {
      const val = parseFloat((a.cost ?? "$400").replace(/[^0-9.]/g, ""));
      return sum + (isNaN(val) ? 400 : val);
    }, 0);

    const prevRevenue = prevAppts.reduce((sum, a) => {
      const val = parseFloat((a.cost ?? "$400").replace(/[^0-9.]/g, ""));
      return sum + (isNaN(val) ? 400 : val);
    }, 0);

    // Lead to Booking Conversion Rate
    const conversionRate = leadsCount > 0 ? (apptsCount / leadsCount) * 100 : 0;
    const prevConversionRate = prevLeadsCount > 0 ? (prevApptsCount / prevLeadsCount) * 100 : 0;

    // Helper for percentage change
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      leads: {
        value: leadsCount,
        change: calculateChange(leadsCount, prevLeadsCount),
      },
      appointments: {
        value: apptsCount,
        change: calculateChange(apptsCount, prevApptsCount),
      },
      revenue: {
        value: revenue,
        change: calculateChange(revenue, prevRevenue),
      },
      conversion: {
        value: Number(conversionRate.toFixed(1)),
        change: Number((conversionRate - prevConversionRate).toFixed(1)),
      },
    };
  }, [filteredData]);

  // Aggregate daily data points for trend charts
  const trendData = useMemo(() => {
    const { currentContacts, currentAppts } = filteredData;
    const now = new Date();
    
    let daysToInclude = 7;
    if (timeframe === "month") daysToInclude = 30;
    else if (timeframe === "all") daysToInclude = 15; // default view for all time groups by last 15 days

    const points: { dateLabel: string; leads: number; appointments: number }[] = [];

    for (let i = daysToInclude - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const dayContacts = currentContacts.filter((c) => {
        const d = new Date(c.createdAt);
        return d >= day && d < nextDay;
      });

      const dayAppts = currentAppts.filter((a) => {
        const d = new Date(a.createdAt);
        return d >= day && d < nextDay;
      });

      const dateLabel = day.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      points.push({
        dateLabel,
        leads: dayContacts.length,
        appointments: dayAppts.length,
      });
    }

    return points;
  }, [filteredData, timeframe]);

  // Drawing helper properties for Trend SVG Chart
  const svgChartDimensions = useMemo(() => {
    const width = 600;
    const height = 220;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 30;

    const maxVal = Math.max(
      ...trendData.map((d) => Math.max(d.leads, d.appointments)),
      4 // ensure we have at least some ticks
    );

    const xStride = (width - paddingLeft - paddingRight) / Math.max(1, trendData.length - 1);
    
    // Construct coordinate lists
    const leadsCoords = trendData.map((d, index) => {
      const x = paddingLeft + index * xStride;
      const y = height - paddingBottom - (d.leads / maxVal) * (height - paddingTop - paddingBottom);
      return { x, y };
    });

    const apptsCoords = trendData.map((d, index) => {
      const x = paddingLeft + index * xStride;
      const y = height - paddingBottom - (d.appointments / maxVal) * (height - paddingTop - paddingBottom);
      return { x, y };
    });

    // Create SVG paths
    const getPathLine = (coords: { x: number; y: number }[]) => {
      if (coords.length === 0) return "";
      return coords.reduce((acc, c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`), "");
    };

    const getAreaPath = (coords: { x: number; y: number }[]) => {
      if (coords.length === 0) return "";
      const line = getPathLine(coords);
      return `${line} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;
    };

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      leadsCoords,
      apptsCoords,
      leadsPath: getPathLine(leadsCoords),
      leadsAreaPath: getAreaPath(leadsCoords),
      apptsPath: getPathLine(apptsCoords),
      apptsAreaPath: getAreaPath(apptsCoords),
      maxVal,
    };
  }, [trendData]);

  // Donut chart calculations
  const donutData = useMemo(() => {
    const conversion = metrics.conversion.value;
    const radius = 60;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    
    const strokeDashoffset = circumference - (conversion / 100) * circumference;

    return {
      radius,
      strokeWidth,
      circumference,
      strokeDashoffset,
    };
  }, [metrics]);

  return (
    <div className="p-4 sm:p-10 pb-24 max-w-[1100px] w-full mx-auto font-sans text-foreground">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-6">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5">
            System Insights
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Analytics & ROI
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time funnel conversion metrics, revenue forecasting, and lead engagement trends.
          </p>
        </div>

        {/* Timeframe Selector & Refresh */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-muted border border-border hover:bg-accent text-foreground text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors duration-150"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <div className="flex bg-muted border border-border rounded-xl p-1">
            {(["week", "month", "all"] as Timeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeframe(t);
                  setHoveredDataIndex(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
                  timeframe === t
                    ? "bg-card text-foreground shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {t === "week" ? "This Week" : t === "month" ? "Last 30 Days" : "All Time"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-card border border-destructive rounded-xl p-10 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Unable to load Analytics Data
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {error}
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            className="bg-foreground text-background border-none rounded-lg px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer hover:opacity-90 font-sans"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="bg-card border border-border rounded-xl p-24 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
          <span className="text-xs sm:text-sm text-muted-foreground">Generating data visualizations…</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── KPI Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Leads */}
            <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Total Web Leads
                </span>
                <div className="p-2 bg-muted rounded-lg text-muted-foreground border border-border/40">
                  <Users size={14} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">
                {metrics.leads.value}
              </h2>
              <div className="flex items-center gap-1">
                {timeframe !== "all" ? (
                  <>
                    <span className={`text-xs font-semibold ${metrics.leads.change >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                      {metrics.leads.change >= 0 ? "+" : ""}{metrics.leads.change}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">vs prev period</span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Across all captured items</span>
                )}
              </div>
            </div>

            {/* Booked Calls */}
            <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Booked Calls
                </span>
                <div className="p-2 bg-muted rounded-lg text-muted-foreground border border-border/40">
                  <PhoneCall size={14} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">
                {metrics.appointments.value}
              </h2>
              <div className="flex items-center gap-1">
                {timeframe !== "all" ? (
                  <>
                    <span className={`text-xs font-semibold ${metrics.appointments.change >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                      {metrics.appointments.change >= 0 ? "+" : ""}{metrics.appointments.change}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">vs prev period</span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground">All call appointments</span>
                )}
              </div>
            </div>

            {/* Est. Revenue */}
            <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Est. Service Value
                </span>
                <div className="p-2 bg-muted rounded-lg text-muted-foreground border border-border/40">
                  <DollarSign size={14} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">
                ${metrics.revenue.value.toLocaleString()}
              </h2>
              <div className="flex items-center gap-1">
                {timeframe !== "all" ? (
                  <>
                    <span className={`text-xs font-semibold ${metrics.revenue.change >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                      {metrics.revenue.change >= 0 ? "+" : ""}{metrics.revenue.change}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">vs prev period</span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Estimated revenue totals</span>
                )}
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Lead Conversion Rate
                </span>
                <div className="p-2 bg-muted rounded-lg text-muted-foreground border border-border/40">
                  <Percent size={14} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">
                {metrics.conversion.value}%
              </h2>
              <div className="flex items-center gap-1">
                {timeframe !== "all" ? (
                  <>
                    <span className={`text-xs font-semibold ${metrics.conversion.change >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                      {metrics.conversion.change >= 0 ? "+" : ""}{metrics.conversion.change}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">rate shift</span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Overall ratio</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Trend chart (Area chart) ── */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-7 relative overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Performance Trends
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overlay comparisons of captured landing page leads and voice call bookings.
                </p>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#6366f1] rounded-full inline-block" />
                  Web Leads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#ec4899] rounded-full inline-block" />
                  Voice Bookings
                </span>
              </div>
            </div>

            {/* SVG Chart area */}
            <div className="w-full relative h-[250px] select-none">
              {/* Tooltip Overlay */}
              {hoveredDataIndex !== null && trendData[hoveredDataIndex] && (
                <div 
                  className="absolute z-10 bg-card/90 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs font-sans pointer-events-none"
                  style={{
                    left: `${Math.min(
                      Math.max(10, svgChartDimensions.leadsCoords[hoveredDataIndex].x - 60),
                      (typeof window !== "undefined" ? window.innerWidth : 600) - 150
                    )}px`,
                    top: "10px",
                  }}
                >
                  <p className="font-semibold text-foreground mb-1.5 border-b border-border pb-1">
                    {trendData[hoveredDataIndex].dateLabel}
                  </p>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center justify-between gap-5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#6366f1] rounded-full" />
                        Leads:
                      </span>
                      <strong className="text-foreground">{trendData[hoveredDataIndex].leads}</strong>
                    </p>
                    <p className="text-muted-foreground flex items-center justify-between gap-5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#ec4899] rounded-full" />
                        Bookings:
                      </span>
                      <strong className="text-foreground">{trendData[hoveredDataIndex].appointments}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Responsive SVG ViewBox */}
              <svg 
                viewBox={`0 0 ${svgChartDimensions.width} ${svgChartDimensions.height}`}
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="apptsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Ticks */}
                {Array.from({ length: 5 }, (_, i) => {
                  const tickVal = Math.round((svgChartDimensions.maxVal / 4) * i);
                  const y = svgChartDimensions.height - svgChartDimensions.paddingBottom - (i * (svgChartDimensions.height - svgChartDimensions.paddingTop - svgChartDimensions.paddingBottom)) / 4;
                  return (
                    <g key={i} className="opacity-40">
                      <line 
                        x1={svgChartDimensions.paddingLeft} 
                        y1={y} 
                        x2={svgChartDimensions.width - svgChartDimensions.paddingRight} 
                        y2={y} 
                        stroke="var(--border)" 
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text 
                        x={svgChartDimensions.paddingLeft - 8} 
                        y={y + 4} 
                        className="text-[9px] font-mono text-muted-foreground fill-current text-right"
                        textAnchor="end"
                      >
                        {tickVal}
                      </text>
                    </g>
                  );
                })}

                {/* SVG Area Paths */}
                {svgChartDimensions.leadsAreaPath && (
                  <path d={svgChartDimensions.leadsAreaPath} fill="url(#leadsGradient)" />
                )}
                {svgChartDimensions.apptsAreaPath && (
                  <path d={svgChartDimensions.apptsAreaPath} fill="url(#apptsGradient)" />
                )}

                {/* SVG Line Paths */}
                {svgChartDimensions.leadsPath && (
                  <path 
                    d={svgChartDimensions.leadsPath} 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                )}
                {svgChartDimensions.apptsPath && (
                  <path 
                    d={svgChartDimensions.apptsPath} 
                    fill="none" 
                    stroke="#ec4899" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                )}

                {/* Interactive Columns & Dots */}
                {trendData.map((d, index) => {
                  const leadPt = svgChartDimensions.leadsCoords[index];
                  const apptPt = svgChartDimensions.apptsCoords[index];
                  
                  const isHovered = hoveredDataIndex === index;
                  
                  return (
                    <g key={index}>
                      {/* Vertical guidance line */}
                      {isHovered && (
                        <line
                          x1={leadPt.x}
                          y1={svgChartDimensions.paddingTop}
                          x2={leadPt.x}
                          y2={svgChartDimensions.height - svgChartDimensions.paddingBottom}
                          stroke="var(--border)"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Dots for Leads */}
                      <circle 
                        cx={leadPt.x} 
                        cy={leadPt.y} 
                        r={isHovered ? 5 : 3} 
                        fill="#6366f1" 
                        stroke="var(--background)" 
                        strokeWidth="1.5"
                      />

                      {/* Dots for Appts */}
                      <circle 
                        cx={apptPt.x} 
                        cy={apptPt.y} 
                        r={isHovered ? 5 : 3} 
                        fill="#ec4899" 
                        stroke="var(--background)" 
                        strokeWidth="1.5"
                      />

                      {/* Day Label Ticks */}
                      {index % (timeframe === "month" ? 5 : 1) === 0 && (
                        <text
                          x={leadPt.x}
                          y={svgChartDimensions.height - 12}
                          className="text-[9px] text-muted-foreground fill-current font-sans text-center"
                          textAnchor="middle"
                        >
                          {d.dateLabel}
                        </text>
                      )}

                      {/* Invisible hover trigger column */}
                      <rect
                        x={leadPt.x - 20}
                        y={svgChartDimensions.paddingTop}
                        width={40}
                        height={svgChartDimensions.height - svgChartDimensions.paddingTop - svgChartDimensions.paddingBottom}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredDataIndex(index)}
                        onMouseLeave={() => setHoveredDataIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ── Funnel & Donut Charts Side-by-Side ── */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Funnel chart (Tapered css bars) */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 md:col-span-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Lead Conversion Funnel
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Drop-off tracking from initial contact details captured to call scheduling.
                </p>
              </div>

              {/* Funnel Stages */}
              <div className="space-y-4 flex-grow flex flex-col justify-center">
                {/* Stage 1: Captured Leads */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold px-1">
                    <span>1. Captured Web Leads</span>
                    <span>100% ({metrics.leads.value})</span>
                  </div>
                  <div className="h-9 bg-gradient-to-r from-[#6366f1]/20 to-[#6366f1] border border-[#6366f1]/40 rounded-xl relative overflow-hidden">
                    <span className="absolute inset-y-0 left-4 flex items-center text-xs font-bold text-foreground">
                      Contact Form Submissions
                    </span>
                  </div>
                </div>

                {/* Connecting arrow */}
                <div className="flex justify-center text-muted-foreground/60 text-xs">
                  ▼ {(metrics.conversion.value)}% Conversion Efficiency
                </div>

                {/* Stage 2: Booked Calls */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold px-1">
                    <span>2. Booked Voice Calls</span>
                    <span>{metrics.conversion.value}% ({metrics.appointments.value})</span>
                  </div>
                  <div 
                    className="h-9 bg-gradient-to-r from-[#ec4899]/20 to-[#ec4899] border border-[#ec4899]/40 rounded-xl relative overflow-hidden transition-all duration-500"
                    style={{ width: `${Math.max(30, metrics.conversion.value)}%` }}
                  >
                    <span className="absolute inset-y-0 left-4 flex items-center text-xs font-bold text-foreground whitespace-nowrap">
                      Vapi Phone Bookings
                    </span>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground flex gap-2">
                <Info size={14} className="text-foreground flex-shrink-0 mt-0.5" />
                <p>
                  {metrics.conversion.value > 15 
                    ? "Your Vapi telephony agent has high scheduling engagement compared to average industry standards (8-12%)."
                    : "Tip: Consider optimizing your Vapi voice prompts or dashboard triggers to improve calling rates."}
                </p>
              </div>
            </div>

            {/* Circular Donut chart */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 md:col-span-2 flex flex-col justify-between items-center text-center">
              <div className="w-full text-left">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Booking Ratio
                </h3>
                <p className="text-xs text-muted-foreground">
                  Proportion of leads converted.
                </p>
              </div>

              {/* Donut Circle */}
              <div className="relative w-36 h-36 my-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track ring */}
                  <circle
                    cx="72"
                    cy="72"
                    r={donutData.radius}
                    fill="transparent"
                    stroke="var(--border)"
                    strokeWidth={donutData.strokeWidth}
                    className="opacity-40"
                  />
                  {/* Progress ring */}
                  {metrics.conversion.value > 0 && (
                    <circle
                      cx="72"
                      cy="72"
                      r={donutData.radius}
                      fill="transparent"
                      stroke="url(#donutRingGradient)"
                      strokeWidth={donutData.strokeWidth}
                      strokeDasharray={donutData.circumference}
                      strokeDashoffset={donutData.strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  )}
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="donutRingGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Central Value */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {metrics.conversion.value}%
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    Ratio
                  </span>
                </div>
              </div>

              {/* Legend & Details */}
              <div className="w-full text-xs grid grid-cols-2 gap-2 border-t border-border pt-4">
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#ec4899] rounded-full" />
                    Scheduled
                  </span>
                  <strong className="text-foreground text-sm mt-1">{metrics.appointments.value}</strong>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-border rounded-full" />
                    Unconverted
                  </span>
                  <strong className="text-foreground text-sm mt-1">
                    {Math.max(0, metrics.leads.value - metrics.appointments.value)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
