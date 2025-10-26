import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  addDoc,
  where, // added
} from "firebase/firestore";

/**
 * Adds utilities to read SOS documents from Firestore.
 */

// initialize firestore (assumes firebase app is initialized elsewhere)
const db = getFirestore();
const sosCollectionRef = collection(db, "sos");
const sosLogsRef = collection(db, "sos_logs");
const usersCollectionRef = collection(db, "users"); // added
const notificationsRef = collection(db, "notifications"); // added

/**
 * Normalize a raw SOS document data into a predictable shape.
 * - location: support either [lat, lng] array or { lat, lng } object
 * - timestamp: convert Firestore Timestamp to JS Date if possible
 */
function formatSOS(id, raw) {
  if (!raw) return null;
  const { location, timestamp, ...rest } = raw;

  let normalizedLocation = null;
  if (Array.isArray(location) && location.length >= 2) {
    normalizedLocation = { lat: Number(location[0]), lng: Number(location[1]) };
  } else if (location && typeof location === "object") {
    const maybeLat = location.lat ?? location[0];
    const maybeLng = location.lng ?? location[1];
    if (maybeLat !== undefined && maybeLng !== undefined) {
      normalizedLocation = { lat: Number(maybeLat), lng: Number(maybeLng) };
    }
  }

  let normalizedTimestamp = timestamp;
  if (timestamp && typeof timestamp.toDate === "function") {
    normalizedTimestamp = timestamp.toDate();
  } else if (timestamp && typeof timestamp.seconds === "number") {
    normalizedTimestamp = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "number") {
    normalizedTimestamp = new Date(timestamp);
  }

  return {
    id,
    location: normalizedLocation,
    timestamp: normalizedTimestamp,
    ...rest,
  };
}

/**
 * Fetch all SOS documents, ordered by timestamp descending.
 * Returns an array of normalized SOS objects.
 */
export async function getAllSOS() {
  const q = query(sosCollectionRef, orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  // filter out any null/invalid documents returned by formatSOS
  return snap.docs.map((d) => formatSOS(d.id, d.data())).filter(Boolean);
}

/* new: subscribe to sos collection in real time */
export function subscribeToSOS(onChange, errorHandler) {
  try {
    const q = query(sosCollectionRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => formatSOS(d.id, d.data())).filter(Boolean);
        onChange(items);
      },
      (err) => {
        if (errorHandler) errorHandler(err);
        else console.error("sos onSnapshot error:", err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error("subscribeToSOS error", err);
    return () => {};
  }
}

/* helpers to update SOS documents */

/**
 * Mark SOS as verified (or add verification details).
 * verificationInfo: { verifiedBy, method: 'auto'|'manual', note }
 */
export async function verifySOS(id, verificationInfo = {}) {
  if (!id) throw new Error("id required");
  const dRef = doc(db, "sos", id);
  await updateDoc(dRef, {
    verified: true,
    verification: {
      ...verificationInfo,
      verifiedAt: serverTimestamp(),
    },
  });
  await logAction(id, "verified", verificationInfo);
}

/**
 * Mark SOS as false alarm with optional remarks.
 */
export async function markFalseAlarm(id, { remarks, actedBy } = {}) {
  if (!id) throw new Error("id required");
  const dRef = doc(db, "sos", id);
  await updateDoc(dRef, {
    verified: false,
    falseAlarm: true,
    falseAlarmInfo: {
      remarks: remarks ?? null,
      actedBy: actedBy ?? null,
      markedAt: serverTimestamp(),
    },
  });
  await logAction(id, "false_alarm", { remarks, actedBy });
}

/**
 * Start response for an SOS (records responder and start time).
 */
export async function startResponse(id, { responderId, responderName } = {}) {
  if (!id) throw new Error("id required");
  const dRef = doc(db, "sos", id);
  await updateDoc(dRef, {
    response: {
      started: true,
      responderId: responderId ?? null,
      responderName: responderName ?? null,
      startedAt: serverTimestamp(),
    },
  });
  await logAction(id, "response_started", { responderId, responderName });
}

/**
 * End response for an SOS (records end time and optional remarks).
 */
export async function endResponse(id, { remarks, actedBy } = {}) {
  if (!id) throw new Error("id required");
  const dRef = doc(db, "sos", id);
  // merge response.end info
  await updateDoc(dRef, {
    "response.ended": true,
    "response.endedAt": serverTimestamp(),
    "response.endRemarks": remarks ?? null,
    "response.endedBy": actedBy ?? null,
  });
  await logAction(id, "response_ended", { remarks, actedBy });
}

/**
 * Add an entry to sos_logs collection for audit/history.
 */
export async function logAction(sosId, actionType, payload = {}) {
  try {
    await addDoc(sosLogsRef, {
      sosId,
      actionType,
      payload,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("logAction error", err);
  }
}

/**
 * Fetch a single SOS document by id.
 * Returns the normalized SOS object or null if not found.
 */
export async function getSOSById(id) {
  if (!id) return null;
  const dRef = doc(db, "sos", id);
  const dSnap = await getDoc(dRef);
  if (!dSnap.exists()) return null;
  return formatSOS(dSnap.id, dSnap.data());
}

/**
 * Check SOS doc fields for a user's affirmative ("yes") reply and auto-verify if found.
 * Looks at common reply fields and does a case-insensitive search for 'yes' or single-character 'y'.
 */
export async function verifyIfYes(sosId) {
  if (!sosId) throw new Error("sosId required");
  const dRef = doc(db, "sos", sosId);
  const snap = await getDoc(dRef);
  if (!snap.exists()) return { found: false, reason: "not_found" };
  const data = snap.data();

  // common fields that might contain user reply
  const replyFields = [
    data?.autoReply,
    data?.confirmation,
    data?.reply,
    data?.userResponse,
    data?.messageReply,
    data?.responseText,
  ].filter(Boolean);

  const foundYes = replyFields.some((v) => {
    try {
      return String(v).trim().toLowerCase().includes("yes") || String(v).trim().toLowerCase() === "y";
    } catch {
      return false;
    }
  });

  if (foundYes) {
    await verifySOS(sosId, { verifiedBy: "auto", method: "auto", note: "Auto-verified via YES reply" });
    return { found: true, autoVerified: true };
  }

  return { found: false, autoVerified: false, checked: replyFields };
}

/**
 * Fetch logs for a given sosId from sos_logs collection.
 */
export async function getSOSLogs(sosId, limit = 50) {
  if (!sosId) return [];
  try {
    const q = query(sosLogsRef, where("sosId", "==", sosId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getSOSLogs error", err);
    return [];
  }
}

/**
 * Warn a user: increment a warnCount on the user doc, record a log, and suspend if threshold reached.
 */
export async function warnUser(userId, { reason, warnedBy } = {}) {
  if (!userId) throw new Error("userId required");
  const uRef = doc(db, "users", userId);
  const uSnap = await getDoc(uRef);
  if (!uSnap.exists()) {
    throw new Error("user not found");
  }
  const userData = uSnap.data();
  const currentWarns = (userData?.warnCount && Number(userData.warnCount)) || 0;
  const newWarns = currentWarns + 1;
  try {
    await updateDoc(uRef, { warnCount: newWarns });
  } catch (err) {
    // if updateDoc fails (maybe field not present), try setDoc merge (omitted here for brevity)
    console.error("warnUser update failed", err);
  }
  await addDoc(sosLogsRef, {
    actionType: "warn_user",
    payload: { userId, reason: reason ?? null, warnedBy: warnedBy ?? null, warnCount: newWarns },
    createdAt: serverTimestamp(),
  });

  // suspend if threshold reached (example threshold = 3)
  if (newWarns >= 3) {
    await suspendUser(userId, { reason: "excessive_false_alarms", suspendedBy: warnedBy ?? "system" });
  }
  return { warnCount: newWarns };
}

/**
 * Suspend a user's SOS access (sets suspended flag on users collection) and log the action.
 */
export async function suspendUser(userId, { reason, suspendedBy } = {}) {
  if (!userId) throw new Error("userId required");
  const uRef = doc(db, "users", userId);
  await updateDoc(uRef, { suspended: true, suspendedAt: serverTimestamp(), suspendReason: reason ?? null });
  await addDoc(sosLogsRef, {
    actionType: "suspend_user",
    payload: { userId, reason, suspendedBy },
    createdAt: serverTimestamp(),
  });
  return { suspended: true };
}

/**
 * Simple "send notification" that records a notification document (placeholder for real push/SMS).
 */
export async function sendNotification(sosId, { target = "responders", message = "", meta = {} } = {}) {
  try {
    await addDoc(notificationsRef, {
      sosId,
      target,
      message,
      meta,
      createdAt: serverTimestamp(),
      status: "queued",
    });
    await addDoc(sosLogsRef, {
      actionType: "notify",
      payload: { sosId, target, message, meta },
      createdAt: serverTimestamp(),
    });
    return { queued: true };
  } catch (err) {
    console.error("sendNotification error", err);
    return { queued: false, error: err.message };
  }
}

/**
 * Simple stats helper: frequency by type, hot spots (rounded lat/lng), average response time (ms).
 * This performs calculations in-memory from getAllSOS results.
 */
export async function getSOSStats({ lastDays = 90 } = {}) {
  try {
    const all = await getAllSOS();
    const cutoff = Date.now() - lastDays * 24 * 60 * 60 * 1000;
    const recent = all.filter((r) => {
      const t = r?.timestamp;
      const ts = t instanceof Date ? t.getTime() : Date.parse(String(t) || "");
      return !isNaN(ts) ? ts >= cutoff : true;
    });

    const byType = {};
    const hotspots = {};
    let responseCount = 0;
    let totalResponseMs = 0;

    recent.forEach((r) => {
      const type = r?.type ?? r?.emergencyType ?? "unknown";
      byType[type] = (byType[type] || 0) + 1;

      const lat = r?.location?.lat;
      const lng = r?.location?.lng;
      if (lat != null && lng != null) {
        // group by 3 decimal places (~100m)
        const key = `${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}`;
        hotspots[key] = (hotspots[key] || 0) + 1;
      }

      const started = r?.response?.startedAt;
      const ended = r?.response?.endedAt;
      if (started && ended) {
        const s = typeof started?.toDate === "function" ? started.toDate().getTime() : Number(started);
        const e = typeof ended?.toDate === "function" ? ended.toDate().getTime() : Number(ended);
        if (!isNaN(s) && !isNaN(e) && e >= s) {
          responseCount++;
          totalResponseMs += e - s;
        }
      }
    });

    const avgResponseMs = responseCount ? Math.round(totalResponseMs / responseCount) : null;

    return { total: recent.length, byType, hotspots, avgResponseMs };
  } catch (err) {
    console.error("getSOSStats error", err);
    return { total: 0, byType: {}, hotspots: {}, avgResponseMs: null };
  }
}

/**
 * Example usage (UI):
 * const sosList = await getAllSOS();
 * // then set state and render fields such as sos.location.lat, sos.location.lng, sos.timestamp
 */