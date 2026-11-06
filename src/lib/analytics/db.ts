import prisma from '@/lib/db';

let tablesInitialized = false;

/**
 * Initializes SQLite analytics tables if they do not exist.
 * Uses atomic IF NOT EXISTS queries to avoid any schema migration friction.
 */
export async function ensureAnalyticsTables(): Promise<void> {
  if (tablesInitialized) return;

  try {
    // 1. Visitors table (Tracks unique visitors & live presence)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS analytics_visitors (
        visitor_id TEXT PRIMARY KEY,
        session_id TEXT,
        device TEXT DEFAULT 'Desktop',
        browser TEXT DEFAULT 'Unknown',
        os TEXT DEFAULT 'Unknown',
        ip_masked TEXT DEFAULT 'Hidden',
        referrer TEXT DEFAULT 'Direct',
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        page_views_count INTEGER DEFAULT 1,
        actions_count INTEGER DEFAULT 0
      );
    `);

    // 2. Events table (Tracks pageviews and user click actions)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        visitor_id TEXT NOT NULL,
        session_id TEXT,
        event_type TEXT NOT NULL,
        page TEXT NOT NULL,
        label TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // Indexes for fast aggregation
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_analytics_visitors_last_seen ON analytics_visitors(last_seen_at);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events(page);
    `);

    tablesInitialized = true;
  } catch (error) {
    console.error('Failed to initialize analytics tables:', error);
  }
}

export interface ChartDataPoint {
  label: string;
  hour?: number;
  date?: string;
  uniqueVisitors: number;
  pageViews: number;
  actionClicks: number;
}

export interface DayVisitRecord {
  date: string; // 'YYYY-MM-DD'
  dateFormatted: string; // 'Today', 'Yesterday', '6 Nov'
  firstSeenAt: string;
  lastSeenAt: string;
  durationSeconds: number;
  durationFormatted: string; // '4m 12s', '< 1 min', etc.
  isLive: boolean;
  pageViewsCount: number;
  actionsCount: number;
  totalEventsCount: number;
  pages: Array<{ page: string; views: number }>;
  actions: Array<{ eventType: string; label: string | null; count: number }>;
}

export interface UniqueClientItem {
  visitorId: string;
  device: string;
  browser: string;
  os: string;
  firstSeenAt: string;
  lastSeenAt: string;
  pageViewsCount: number;
  actionsCount: number;
  isLive: boolean;
  lastPage: string;
  lastAction: string;
  intent: 'HIGH' | 'ENGAGED' | 'BROWSING';
  // Rich day-wise, duration, and page-wise telemetry
  durationSeconds: number;
  durationFormatted: string;
  totalDaysVisited: number;
  isMultiDay: boolean;
  dealStatus: 'WHATSAPP_LEAD' | 'CALL_LEAD' | 'BOOKING_LEAD' | 'ENQUIRY_LEAD' | 'BROWSING';
  pageWiseList: Array<{ page: string; views: number }>;
  actionsList: Array<{ eventType: string; label: string | null; count: number }>;
  dayVisits: DayVisitRecord[];
}

export interface DayWiseSummary {
  date: string;
  dateFormatted: string;
  uniqueVisitors: number;
  pageViews: number;
  actionClicks: number;
  dealsCount: number;
  clientCount: number;
  topPages: Array<{ page: string; views: number }>;
}

export interface AnalyticsStats {
  liveVisitors: number;
  uniqueVisitorsToday: number;
  totalUniqueVisitors: number;
  totalPageViews: number;
  totalActionClicks: number;
  actionsToday: number;
  actionBreakdown: {
    whatsappClicks: number;
    callClicks: number;
    bookingClicks: number;
    enquirySubmits: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topPages: Array<{ page: string; views: number }>;
  chartData: ChartDataPoint[];
  uniqueClients: UniqueClientItem[];
  dayWiseSummaries: DayWiseSummary[];
  recentEvents: Array<{
    id: string;
    visitorId: string;
    eventType: string;
    page: string;
    label: string | null;
    device: string;
    browser: string;
    createdAt: string;
  }>;
}

/**
 * Ingest a tracking heartbeat or action event into the database.
 * Strictly ignores internal admin portal (/admin) navigations.
 */
export async function recordVisitorEvent(payload: {
  visitorId: string;
  sessionId?: string;
  eventType: string;
  page: string;
  label?: string;
  metadata?: any;
  device?: string;
  browser?: string;
  os?: string;
  ip?: string;
  referrer?: string;
}): Promise<void> {
  // Do not track internal admin portal navigations as public client visits
  if (payload.page && payload.page.startsWith('/admin')) {
    return;
  }

  await ensureAnalyticsTables();

  const now = new Date().toISOString();
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const metadataString = payload.metadata ? JSON.stringify(payload.metadata) : null;
  const isAction = payload.eventType !== 'pageview' && payload.eventType !== 'heartbeat';

  // 1. Upsert Visitor
  await prisma.$executeRawUnsafe(
    `
    INSERT INTO analytics_visitors (
      visitor_id, session_id, device, browser, os, ip_masked, referrer, first_seen_at, last_seen_at, page_views_count, actions_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(visitor_id) DO UPDATE SET
      last_seen_at = excluded.last_seen_at,
      session_id = COALESCE(excluded.session_id, analytics_visitors.session_id),
      device = COALESCE(excluded.device, analytics_visitors.device),
      browser = COALESCE(excluded.browser, analytics_visitors.browser),
      os = COALESCE(excluded.os, analytics_visitors.os),
      page_views_count = analytics_visitors.page_views_count + (CASE WHEN ? = 'pageview' THEN 1 ELSE 0 END),
      actions_count = analytics_visitors.actions_count + (CASE WHEN ? = 1 THEN 1 ELSE 0 END);
  `,
    payload.visitorId,
    payload.sessionId || null,
    payload.device || 'Desktop',
    payload.browser || 'Unknown',
    payload.os || 'Unknown',
    payload.ip || 'Local',
    payload.referrer || 'Direct',
    now,
    now,
    payload.eventType === 'pageview' ? 1 : 0,
    isAction ? 1 : 0,
    payload.eventType,
    isAction ? 1 : 0
  );

  // 2. Insert Event (omit pure periodic heartbeats from full event log to save space)
  if (payload.eventType !== 'heartbeat') {
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO analytics_events (
        id, visitor_id, session_id, event_type, page, label, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `,
      eventId,
      payload.visitorId,
      payload.sessionId || null,
      payload.eventType,
      payload.page || '/',
      payload.label || null,
      metadataString,
      now
    );
  }
}

function formatDuration(seconds: number, isLive: boolean): string {
  if (isLive && seconds < 30) return "Active now (< 1m)";
  if (isLive) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `Active now (${mins}m ${secs}s)`;
  }
  if (seconds < 30) return "< 1 min";
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function formatDateLabel(dateStr: string): string {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterdayDate = new Date(now.getTime() - 86400000);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  try {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  } catch {
    return dateStr;
  }
}

/**
 * Query real-time analytics for the Admin Dashboard.
 * Filters out internal admin navigations so client telemetry reflects real prospective customers.
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  await ensureAnalyticsTables();

  const now = new Date();
  // Live threshold: active within the last 5 minutes
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  // Start of today (UTC)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // Run raw queries for high performance aggregation (excluding /admin)
  const [
    liveVisitorsResult,
    uniqueTodayResult,
    totalUniqueResult,
    totalViewsResult,
    totalActionsResult,
    actionsTodayResult,
    actionBreakdownResult,
    deviceBreakdownResult,
    topPagesResult,
    recentEventsResult,
    dayVisitsResult,
    dayPagesResult,
    dayActionsResult,
    multiDaysResult,
  ] = await Promise.all([
    // 1. Live visitors in last 5 minutes (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM analytics_events WHERE page NOT LIKE '/admin%' AND created_at >= ?`,
      fiveMinutesAgo
    ),
    // 2. Unique visitors today (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM analytics_events WHERE page NOT LIKE '/admin%' AND created_at >= ?`,
      startOfToday
    ),
    // 3. Total unique visitors all time (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM analytics_events WHERE page NOT LIKE '/admin%'`
    ),
    // 4. Total pageviews (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'pageview' AND page NOT LIKE '/admin%'`
    ),
    // 5. Total action clicks (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM analytics_events WHERE event_type != 'pageview' AND page NOT LIKE '/admin%'`
    ),
    // 6. Actions taken today (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM analytics_events WHERE event_type != 'pageview' AND page NOT LIKE '/admin%' AND created_at >= ?`,
      startOfToday
    ),
    // 7. Action breakdown (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT event_type, COUNT(*) as count FROM analytics_events WHERE event_type != 'pageview' AND page NOT LIKE '/admin%' GROUP BY event_type`
    ),
    // 8. Device breakdown
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COALESCE(v.device, 'Desktop') as device, COUNT(DISTINCT e.visitor_id) as count 
       FROM analytics_events e
       LEFT JOIN analytics_visitors v ON e.visitor_id = v.visitor_id
       WHERE e.page NOT LIKE '/admin%'
       GROUP BY device`
    ),
    // 9. Top pages (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT page, COUNT(*) as count FROM analytics_events WHERE event_type = 'pageview' AND page NOT LIKE '/admin%' GROUP BY page ORDER BY count DESC LIMIT 5`
    ),
    // 10. Recent real events (excluding /admin)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        e.id, 
        e.visitor_id as visitorId, 
        e.event_type as eventType, 
        e.page, 
        e.label, 
        e.created_at as createdAt,
        COALESCE(v.device, 'Desktop') as device,
        COALESCE(v.browser, 'Browser') as browser
       FROM analytics_events e
       LEFT JOIN analytics_visitors v ON e.visitor_id = v.visitor_id
       WHERE e.page NOT LIKE '/admin%'
       ORDER BY e.created_at DESC
       LIMIT 15`
    ),
    // 11. Day-wise client visits list (aggregates each visitor per day)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        e.visitor_id as visitorId,
        date(e.created_at) as visitDate,
        COALESCE(v.device, 'Desktop') as device,
        COALESCE(v.browser, 'Browser') as browser,
        COALESCE(v.os, 'Unknown') as os,
        MIN(e.created_at) as firstSeenAt,
        MAX(e.created_at) as lastSeenAt,
        COUNT(CASE WHEN e.event_type = 'pageview' THEN 1 END) as pageViewsCount,
        COUNT(CASE WHEN e.event_type != 'pageview' THEN 1 END) as actionsCount,
        COUNT(*) as totalEventsCount
      FROM analytics_events e
      LEFT JOIN analytics_visitors v ON e.visitor_id = v.visitor_id
      WHERE e.page NOT LIKE '/admin%'
      GROUP BY e.visitor_id, date(e.created_at)
      ORDER BY visitDate DESC, lastSeenAt DESC
      LIMIT 100`
    ),
    // 12. Page-wise breakdown per visitor per day
    prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        visitor_id as visitorId,
        date(created_at) as visitDate,
        page,
        COUNT(*) as views
      FROM analytics_events
      WHERE page NOT LIKE '/admin%' AND event_type = 'pageview'
      GROUP BY visitor_id, date(created_at), page
      ORDER BY views DESC`
    ),
    // 13. Actions breakdown per visitor per day
    prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        visitor_id as visitorId,
        date(created_at) as visitDate,
        event_type as eventType,
        label,
        COUNT(*) as count
      FROM analytics_events
      WHERE page NOT LIKE '/admin%' AND event_type != 'pageview'
      GROUP BY visitor_id, date(created_at), event_type, label
      ORDER BY count DESC`
    ),
    // 14. Total distinct days visited per visitor (for multi-day detection)
    prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        visitor_id as visitorId,
        COUNT(DISTINCT date(created_at)) as totalDaysVisited
      FROM analytics_events
      WHERE page NOT LIKE '/admin%'
      GROUP BY visitor_id`
    ),
  ]);

  const liveVisitors = Number(liveVisitorsResult[0]?.count ?? 0);
  const uniqueVisitorsToday = Number(uniqueTodayResult[0]?.count ?? 0);
  const totalUniqueVisitors = Number(totalUniqueResult[0]?.count ?? 0);
  const totalPageViews = Number(totalViewsResult[0]?.count ?? 0);
  const totalActionClicks = Number(totalActionsResult[0]?.count ?? 0);
  const actionsToday = Number(actionsTodayResult[0]?.count ?? 0);

  // Parse action breakdown
  let whatsappClicks = 0;
  let callClicks = 0;
  let bookingClicks = 0;
  let enquirySubmits = 0;

  for (const row of actionBreakdownResult) {
    const type = row.event_type;
    const count = Number(row.count ?? 0);
    if (type === 'click_whatsapp') whatsappClicks += count;
    else if (type === 'click_call') callClicks += count;
    else if (type === 'submit_booking' || type === 'click_book') bookingClicks += count;
    else if (type === 'submit_enquiry') enquirySubmits += count;
  }

  // Parse device breakdown
  let mobile = 0;
  let desktop = 0;
  let tablet = 0;

  for (const row of deviceBreakdownResult) {
    const dev = (row.device || '').toLowerCase();
    const count = Number(row.count ?? 0);
    if (dev.includes('mobile') || dev.includes('phone') || dev.includes('android') || dev.includes('iphone')) {
      mobile += count;
    } else if (dev.includes('tablet') || dev.includes('ipad')) {
      tablet += count;
    } else {
      desktop += count;
    }
  }

  const topPages = topPagesResult.map((r: any) => ({
    page: String(r.page || '/'),
    views: Number(r.count ?? 0),
  }));

  const recentEvents = recentEventsResult.map((e: any) => ({
    id: String(e.id),
    visitorId: String(e.visitorId),
    eventType: String(e.eventType),
    page: String(e.page),
    label: e.label ? String(e.label) : null,
    device: String(e.device),
    browser: String(e.browser),
    createdAt: String(e.createdAt),
  }));

  // Build Lookup Maps for Day-Wise telemetry
  const multiDayMap = new Map<string, number>();
  for (const row of multiDaysResult) {
    multiDayMap.set(String(row.visitorId), Number(row.totalDaysVisited ?? 1));
  }

  const pagesMap = new Map<string, Array<{ page: string; views: number }>>();
  for (const row of dayPagesResult) {
    const key = `${row.visitorId}_${row.visitDate}`;
    const arr = pagesMap.get(key) || [];
    arr.push({ page: String(row.page), views: Number(row.views ?? 0) });
    pagesMap.set(key, arr);
  }

  const actionsMap = new Map<string, Array<{ eventType: string; label: string | null; count: number }>>();
  for (const row of dayActionsResult) {
    const key = `${row.visitorId}_${row.visitDate}`;
    const arr = actionsMap.get(key) || [];
    arr.push({
      eventType: String(row.eventType),
      label: row.label ? String(row.label) : null,
      count: Number(row.count ?? 0),
    });
    actionsMap.set(key, arr);
  }

  // Group Day Visits by visitorId
  const visitorDayRecordsMap = new Map<string, DayVisitRecord[]>();
  const visitorMetaMap = new Map<string, { device: string; browser: string; os: string }>();

  // Also group day summaries
  const daySummaryMap = new Map<string, {
    date: string;
    dateFormatted: string;
    uniqueVisitors: Set<string>;
    pageViews: number;
    actionClicks: number;
    dealsCount: number;
    topPagesMap: Map<string, number>;
  }>();

  for (const row of dayVisitsResult) {
    const visitorId = String(row.visitorId);
    const visitDate = String(row.visitDate);
    const firstSeenAt = String(row.firstSeenAt);
    const lastSeenAt = String(row.lastSeenAt);

    const startMs = new Date(firstSeenAt).getTime();
    const endMs = new Date(lastSeenAt).getTime();
    const durationSeconds = Math.max(0, Math.round((endMs - startMs) / 1000));
    const isLive = endMs >= now.getTime() - 5 * 60 * 1000;
    const durationFormatted = formatDuration(durationSeconds, isLive);
    const dateFormatted = formatDateLabel(visitDate);

    const key = `${visitorId}_${visitDate}`;
    const pages = pagesMap.get(key) || [];
    const actions = actionsMap.get(key) || [];
    const pageViewsCount = Number(row.pageViewsCount ?? 0);
    const actionsCount = Number(row.actionsCount ?? 0);
    const totalEventsCount = Number(row.totalEventsCount ?? 0);

    const record: DayVisitRecord = {
      date: visitDate,
      dateFormatted,
      firstSeenAt,
      lastSeenAt,
      durationSeconds,
      durationFormatted,
      isLive,
      pageViewsCount,
      actionsCount,
      totalEventsCount,
      pages,
      actions,
    };

    const records = visitorDayRecordsMap.get(visitorId) || [];
    records.push(record);
    visitorDayRecordsMap.set(visitorId, records);

    if (!visitorMetaMap.has(visitorId)) {
      visitorMetaMap.set(visitorId, {
        device: String(row.device || 'Desktop'),
        browser: String(row.browser || 'Browser'),
        os: String(row.os || 'Unknown'),
      });
    }

    // Accumulate day-wise summary
    let daySum = daySummaryMap.get(visitDate);
    if (!daySum) {
      daySum = {
        date: visitDate,
        dateFormatted,
        uniqueVisitors: new Set<string>(),
        pageViews: 0,
        actionClicks: 0,
        dealsCount: 0,
        topPagesMap: new Map<string, number>(),
      };
      daySummaryMap.set(visitDate, daySum);
    }
    daySum.uniqueVisitors.add(visitorId);
    daySum.pageViews += pageViewsCount;
    daySum.actionClicks += actionsCount;
    if (actionsCount > 0) daySum.dealsCount += 1;
    for (const p of pages) {
      daySum.topPagesMap.set(p.page, (daySum.topPagesMap.get(p.page) || 0) + p.views);
    }
  }

  // Construct deduplicated uniqueClients with full day-wise telemetry
  const uniqueClients: UniqueClientItem[] = [];
  for (const [visitorId, dayVisits] of visitorDayRecordsMap.entries()) {
    // Sort visits newest date to oldest
    dayVisits.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

    const meta = visitorMetaMap.get(visitorId) || { device: 'Desktop', browser: 'Browser', os: 'Unknown' };
    const totalDaysVisited = multiDayMap.get(visitorId) || dayVisits.length;
    const isMultiDay = totalDaysVisited > 1;

    let totalPageViews = 0;
    let totalActions = 0;
    let totalDurationSeconds = 0;
    let hasLive = false;
    let lastSeenAt = dayVisits[0]?.lastSeenAt || now.toISOString();
    let firstSeenAt = dayVisits[dayVisits.length - 1]?.firstSeenAt || now.toISOString();

    const allPagesMap = new Map<string, number>();
    const allActionsMap = new Map<string, { eventType: string; label: string | null; count: number }>();

    for (const d of dayVisits) {
      totalPageViews += d.pageViewsCount;
      totalActions += d.actionsCount;
      totalDurationSeconds += d.durationSeconds;
      if (d.isLive) hasLive = true;

      for (const p of d.pages) {
        allPagesMap.set(p.page, (allPagesMap.get(p.page) || 0) + p.views);
      }
      for (const a of d.actions) {
        const exist = allActionsMap.get(a.eventType);
        if (exist) {
          exist.count += a.count;
        } else {
          allActionsMap.set(a.eventType, { ...a });
        }
      }
    }

    const pageWiseList = Array.from(allPagesMap.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views);

    const actionsList = Array.from(allActionsMap.values());

    // Determine dealStatus
    let dealStatus: 'WHATSAPP_LEAD' | 'CALL_LEAD' | 'BOOKING_LEAD' | 'ENQUIRY_LEAD' | 'BROWSING' = 'BROWSING';
    if (allActionsMap.has('click_whatsapp')) {
      dealStatus = 'WHATSAPP_LEAD';
    } else if (allActionsMap.has('click_call')) {
      dealStatus = 'CALL_LEAD';
    } else if (allActionsMap.has('click_book') || allActionsMap.has('submit_booking')) {
      dealStatus = 'BOOKING_LEAD';
    } else if (allActionsMap.has('submit_enquiry')) {
      dealStatus = 'ENQUIRY_LEAD';
    }

    // Determine Intent
    let intent: 'HIGH' | 'ENGAGED' | 'BROWSING' = 'BROWSING';
    if (totalActions > 0) intent = 'HIGH';
    else if (totalPageViews >= 3) intent = 'ENGAGED';

    const lastPage = pageWiseList[0]?.page || '/';
    const lastAction = actionsList[0]?.eventType || 'pageview';

    uniqueClients.push({
      visitorId,
      device: meta.device,
      browser: meta.browser,
      os: meta.os,
      firstSeenAt,
      lastSeenAt,
      pageViewsCount: totalPageViews,
      actionsCount: totalActions,
      isLive: hasLive,
      lastPage,
      lastAction,
      intent,
      durationSeconds: totalDurationSeconds,
      durationFormatted: formatDuration(totalDurationSeconds, hasLive),
      totalDaysVisited,
      isMultiDay,
      dealStatus,
      pageWiseList,
      actionsList,
      dayVisits,
    });
  }

  // Sort unique clients by last seen descending
  uniqueClients.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

  // Construct dayWiseSummaries sorted by date descending
  const dayWiseSummaries: DayWiseSummary[] = Array.from(daySummaryMap.values())
    .map((s) => ({
      date: s.date,
      dateFormatted: s.dateFormatted,
      uniqueVisitors: s.uniqueVisitors.size,
      pageViews: s.pageViews,
      actionClicks: s.actionClicks,
      dealsCount: s.dealsCount,
      clientCount: s.uniqueVisitors.size,
      topPages: Array.from(s.topPagesMap.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Generate 8-point hourly chart progression for today
  // Points: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
  const chartIntervals = [
    { hour: 0, label: '12 AM' },
    { hour: 3, label: '3 AM' },
    { hour: 6, label: '6 AM' },
    { hour: 9, label: '9 AM' },
    { hour: 12, label: '12 PM' },
    { hour: 15, label: '3 PM' },
    { hour: 18, label: '6 PM' },
    { hour: 21, label: '9 PM' },
  ];

  // Fetch hourly stats for today
  const hourlyRows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      CAST(strftime('%H', created_at) AS INTEGER) as hr,
      COUNT(DISTINCT visitor_id) as visitors,
      COUNT(CASE WHEN event_type = 'pageview' THEN 1 END) as views,
      COUNT(CASE WHEN event_type != 'pageview' THEN 1 END) as actions
    FROM analytics_events
    WHERE page NOT LIKE '/admin%' AND created_at >= ?
    GROUP BY hr
  `, startOfToday).catch(() => []);

  const hourlyMap = new Map<number, { visitors: number; views: number; actions: number }>();
  for (const row of hourlyRows) {
    hourlyMap.set(Number(row.hr), {
      visitors: Number(row.visitors ?? 0),
      views: Number(row.views ?? 0),
      actions: Number(row.actions ?? 0),
    });
  }

  const chartData: ChartDataPoint[] = chartIntervals.map((interval) => {
    // Check traffic within this 3-hour window
    let vCount = 0;
    let viewCount = 0;
    let actCount = 0;

    for (let h = interval.hour; h < interval.hour + 3; h++) {
      const data = hourlyMap.get(h);
      if (data) {
        vCount += data.visitors;
        viewCount += data.views;
        actCount += data.actions;
      }
    }

    return {
      label: interval.label,
      hour: interval.hour,
      uniqueVisitors: vCount,
      pageViews: viewCount,
      actionClicks: actCount,
    };
  });

  return {
    liveVisitors,
    uniqueVisitorsToday,
    totalUniqueVisitors,
    totalPageViews,
    totalActionClicks,
    actionsToday,
    actionBreakdown: {
      whatsappClicks,
      callClicks,
      bookingClicks,
      enquirySubmits,
    },
    deviceBreakdown: {
      mobile,
      desktop,
      tablet,
    },
    topPages,
    chartData,
    uniqueClients,
    dayWiseSummaries,
    recentEvents,
  };
}
