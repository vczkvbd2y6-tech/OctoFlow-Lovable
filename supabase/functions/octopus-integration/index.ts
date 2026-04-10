import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const OCTOPUS_API_BASE = "https://api.octopus.energy/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // User client for auth
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for DB operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "connect":
        return await handleConnect(adminClient, user.id, body);
      case "disconnect":
        return await handleDisconnect(adminClient, user.id);
      case "status":
        return await handleStatus(adminClient, user.id);
      case "sync":
        return await handleSync(adminClient, user.id);
      case "compare":
        return await handleCompare(adminClient, user.id);
      default:
        return jsonResponse({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    console.error("octopus-integration error:", err);
    return jsonResponse({ error: err.message || "Internal error" }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- CONNECT ---
async function handleConnect(admin: any, userId: string, body: any) {
  const { accountNumber, apiKey } = body;
  if (!accountNumber || !apiKey) {
    return jsonResponse({ error: "Account number and API key are required" }, 400);
  }

  // Validate credentials by calling Octopus account endpoint
  const { data: accountData, error: octError } = await fetchOctopusAccount(apiKey, accountNumber);
  if (!accountData) {
    console.error("[CONNECT] Octopus API validation failed:", octError);
    return jsonResponse({ error: octError || "Invalid Octopus credentials. Check your account number and API key." }, 400);
  }

  // Upsert connection (store API key server-side only — base64 encoded)
  const encoded = btoa(apiKey);
  const { data: conn, error: connErr } = await admin
    .from("octopus_connections")
    .upsert({
      user_id: userId,
      account_number: accountNumber,
      api_key_encrypted: encoded,
      status: "connected",
      sync_status: "idle",
      sync_error: null,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (connErr) {
    console.error("Connection upsert error:", connErr);
    return jsonResponse({ error: "Failed to save connection" }, 500);
  }

  // Clear old meter points for this user
  await admin.from("octopus_meter_points").delete().eq("user_id", userId);

  // Extract and store meter points
  const meters: any[] = [];
  for (const prop of accountData.properties || []) {
    for (const ep of prop.electricity_meter_points || []) {
      const mpan = ep.mpan;
      const isExport = ep.is_export || false;
      for (const meter of ep.meters || []) {
        const tariffCode = ep.agreements?.length > 0
          ? ep.agreements[ep.agreements.length - 1].tariff_code
          : null;
        meters.push({
          user_id: userId,
          connection_id: conn.id,
          fuel_type: "electricity",
          mpan_mprn: mpan,
          serial_number: meter.serial_number,
          tariff_code: tariffCode,
          is_export: isExport,
        });
      }
    }
    for (const gp of prop.gas_meter_points || []) {
      const mprn = gp.mprn;
      for (const meter of gp.meters || []) {
        const tariffCode = gp.agreements?.length > 0
          ? gp.agreements[gp.agreements.length - 1].tariff_code
          : null;
        meters.push({
          user_id: userId,
          connection_id: conn.id,
          fuel_type: "gas",
          mpan_mprn: mprn,
          serial_number: meter.serial_number,
          tariff_code: tariffCode,
          is_export: false,
        });
      }
    }
  }

  if (meters.length > 0) {
    const { error: meterErr } = await admin.from("octopus_meter_points").insert(meters);
    if (meterErr) {
      console.error("Meter insert error:", meterErr);
    }
  }

  return jsonResponse({
    connected: true,
    meters_found: meters.length,
    account_number: accountNumber,
  });
}

// --- DISCONNECT ---
async function handleDisconnect(admin: any, userId: string) {
  await admin.from("octopus_connections").delete().eq("user_id", userId);
  await admin.from("tariff_comparisons_cache").delete().eq("user_id", userId);
  return jsonResponse({ disconnected: true });
}

// --- STATUS ---
async function handleStatus(admin: any, userId: string) {
  const { data: conn } = await admin
    .from("octopus_connections")
    .select("id, account_number, status, last_synced_at, sync_status, sync_error, connected_at")
    .eq("user_id", userId)
    .single();

  if (!conn) {
    return jsonResponse({ connected: false });
  }

  const { data: meters } = await admin
    .from("octopus_meter_points")
    .select("id, fuel_type, mpan_mprn, serial_number, tariff_code, is_export")
    .eq("user_id", userId);

  const { count: usageDays } = await admin
    .from("octopus_usage_daily")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  return jsonResponse({
    connected: true,
    account_number: conn.account_number,
    status: conn.status,
    last_synced_at: conn.last_synced_at,
    sync_status: conn.sync_status,
    sync_error: conn.sync_error,
    connected_at: conn.connected_at,
    meters: meters || [],
    usage_days_stored: usageDays || 0,
  });
}

// --- SYNC ---
async function handleSync(admin: any, userId: string) {
  const { data: conn } = await admin
    .from("octopus_connections")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!conn) {
    return jsonResponse({ error: "No Octopus connection found" }, 400);
  }

  await admin.from("octopus_connections").update({
    sync_status: "syncing",
    updated_at: new Date().toISOString(),
  }).eq("id", conn.id);

  const apiKey = atob(conn.api_key_encrypted);

  const { data: meters } = await admin
    .from("octopus_meter_points")
    .select("*")
    .eq("user_id", userId);

  if (!meters || meters.length === 0) {
    await admin.from("octopus_connections").update({
      sync_status: "error",
      sync_error: "No meter points found",
      updated_at: new Date().toISOString(),
    }).eq("id", conn.id);
    return jsonResponse({ error: "No meters to sync" }, 400);
  }

  const periodTo = new Date();
  const periodFrom = new Date();
  periodFrom.setDate(periodFrom.getDate() - 90);

  const fromStr = periodFrom.toISOString();
  const toStr = periodTo.toISOString();

  let totalImported = 0;
  let syncError: string | null = null;

  for (const meter of meters) {
    try {
      const fuelPath = meter.fuel_type === "electricity" ? "electricity-meter-points" : "gas-meter-points";
      const url = `${OCTOPUS_API_BASE}/${fuelPath}/${meter.mpan_mprn}/meters/${meter.serial_number}/consumption/?period_from=${fromStr}&period_to=${toStr}&group_by=day&order_by=period&page_size=200`;

      console.log(`[SYNC] Fetching: ${meter.fuel_type} ${meter.serial_number}`);

      const resp = await fetch(url, {
        headers: { Authorization: "Basic " + btoa(apiKey + ":") },
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        console.error(`[SYNC] Octopus API error for ${meter.serial_number}: ${resp.status} ${errText}`);
        continue;
      }

      const data = await resp.json();
      const results = data.results || [];

      const rows = results
        .filter((r: any) => r.consumption != null && r.interval_start)
        .map((r: any) => ({
          user_id: userId,
          meter_point_id: meter.id,
          usage_date: r.interval_start.substring(0, 10),
          consumption_kwh: r.consumption,
          fuel_type: meter.fuel_type,
          is_export: meter.is_export,
        }));

      if (rows.length > 0) {
        const { error: insertErr } = await admin
          .from("octopus_usage_daily")
          .upsert(rows, { onConflict: "meter_point_id,usage_date,is_export" });

        if (insertErr) {
          console.error("[SYNC] Usage insert error:", insertErr);
        } else {
          totalImported += rows.length;
        }
      }
    } catch (err) {
      console.error(`[SYNC] Error for meter ${meter.serial_number}:`, err);
      syncError = err.message;
    }
  }

  await admin.from("tariff_comparisons_cache").delete().eq("user_id", userId);

  await admin.from("octopus_connections").update({
    sync_status: syncError ? "error" : "success",
    sync_error: syncError,
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", conn.id);

  return jsonResponse({
    synced: true,
    days_imported: totalImported,
    error: syncError,
  });
}

// --- COMPARE ---
async function handleCompare(admin: any, userId: string) {
  const { data: usage } = await admin
    .from("octopus_usage_daily")
    .select("usage_date, consumption_kwh")
    .eq("user_id", userId)
    .eq("fuel_type", "electricity")
    .eq("is_export", false)
    .order("usage_date", { ascending: true });

  if (!usage || usage.length === 0) {
    return jsonResponse({ error: "No usage data available. Sync first." }, 400);
  }

  const monthlyMap: Record<string, number> = {};
  for (const row of usage) {
    const month = row.usage_date.substring(0, 7);
    monthlyMap[month] = (monthlyMap[month] || 0) + Number(row.consumption_kwh);
  }

  const months = Object.keys(monthlyMap).sort();
  const monthlyKwh = months.map(m => ({ month: m, kwh: Math.round(monthlyMap[m] * 100) / 100 }));
  const totalKwh = monthlyKwh.reduce((sum, m) => sum + m.kwh, 0);
  const daysOfData = usage.length;
  const annualizedKwh = daysOfData >= 30 ? (totalKwh / daysOfData) * 365 : totalKwh;

  const tariffs = [
    { name: "Octopus Agile", value: "agile", avgImport: 18.5, avgExport: 9.3 },
    { name: "Octopus Fixed", value: "fixed", avgImport: 24.5, avgExport: 15.0 },
    { name: "Octopus Tracker", value: "tracker", avgImport: 20.2, avgExport: 10.5 },
  ];

  const { data: meters } = await admin
    .from("octopus_meter_points")
    .select("tariff_code, is_export")
    .eq("user_id", userId)
    .eq("fuel_type", "electricity")
    .eq("is_export", false)
    .limit(1);

  const currentTariffCode = meters?.[0]?.tariff_code || "";

  let detectedTariff = "unknown";
  const codeLower = currentTariffCode.toLowerCase();
  if (codeLower.includes("agile")) detectedTariff = "agile";
  else if (codeLower.includes("fix") || codeLower.includes("flex")) detectedTariff = "fixed";
  else if (codeLower.includes("track")) detectedTariff = "tracker";

  const comparisons = tariffs.map(t => {
    const annualCost = (annualizedKwh * t.avgImport) / 100;
    const monthlyCost = annualCost / 12;
    return {
      tariff: t.name,
      value: t.value,
      avgRate: t.avgImport,
      annualCostEstimate: Math.round(annualCost * 100) / 100,
      monthlyCostEstimate: Math.round(monthlyCost * 100) / 100,
      isCurrent: t.value === detectedTariff,
    };
  });

  comparisons.sort((a, b) => a.annualCostEstimate - b.annualCostEstimate);

  const cheapest = comparisons[0];
  const currentComp = comparisons.find(c => c.isCurrent);
  const potentialSaving = currentComp
    ? Math.round((currentComp.annualCostEstimate - cheapest.annualCostEstimate) * 100) / 100
    : null;

  return jsonResponse({
    annualized_kwh: Math.round(annualizedKwh),
    days_of_data: daysOfData,
    monthly_usage: monthlyKwh,
    detected_tariff: detectedTariff,
    current_tariff_code: currentTariffCode,
    comparisons,
    cheapest_tariff: cheapest.value,
    potential_annual_saving: potentialSaving,
  });
}

// --- Octopus API helpers ---
async function fetchOctopusAccount(apiKey: string, accountNumber: string): Promise<{ data: any; error: string | null }> {
  try {
    const url = `${OCTOPUS_API_BASE}/accounts/${accountNumber}/`;
    console.log(`[CONNECT] Calling Octopus account endpoint: ${url}`);
    
    const resp = await fetch(url, {
      headers: { Authorization: "Basic " + btoa(apiKey + ":") },
    });
    
    console.log(`[CONNECT] Octopus API response status: ${resp.status}`);
    
    if (resp.status === 401) {
      return { data: null, error: "Invalid API key. Make sure you're using the API key from your Octopus dashboard." };
    }
    if (resp.status === 403) {
      return { data: null, error: "API key does not have access to this account. Check your account number." };
    }
    if (resp.status === 404) {
      return { data: null, error: "Account not found. Check your account number (format: A-ABCD1234)." };
    }
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      return { data: null, error: `Octopus API returned ${resp.status}: ${body || "Unknown error"}` };
    }
    
    const data = await resp.json();
    return { data, error: null };
  } catch (err) {
    console.error("[CONNECT] Network error calling Octopus API:", err);
    return { data: null, error: `Network error: ${err.message || "Failed to reach Octopus API"}` };
  }
}
