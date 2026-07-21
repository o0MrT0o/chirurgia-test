'use strict';
/* =====================================================================
   NOTIFY.JS — powiadomienia przypominające o powrocie do gry.
   - APK (Capacitor): prawdziwe powiadomienia systemowe, działają nawet
     przy zamkniętej aplikacji (wtyczka @capacitor/local-notifications).
   - Przeglądarka: Web Notifications (fallback przez setTimeout — działają,
     póki karta żyje / jest w tle).
   Powiadomienia są PLANOWANE na przyszłość, gdy gracz wychodzi z gry,
   bo aplikacja nie działa, by je odpalić.
   ===================================================================== */

const Notify = (() => {
  const ALL_IDS = [1, 2, 3, 4]; // 1=wyprawa 2=badanie 3=offline 4=bonus dzienny
  const webTimers = {};

  // Wtyczka Capacitora (jeśli gra działa jako APK).
  function cap() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
  }

  async function requestPermission() {
    try {
      const C = cap();
      if (C) { const r = await C.requestPermissions(); return r && r.display === 'granted'; }
      if ('Notification' in window) { return (await Notification.requestPermission()) === 'granted'; }
    } catch (e) {}
    return false;
  }

  function permissionGranted() {
    if (cap()) return true; // w APK zakładamy zgodę (prosimy przy włączaniu)
    return ('Notification' in window) && Notification.permission === 'granted';
  }

  // Zaplanuj listę powiadomień: [{id, title, body, at(ms w przyszłości)}].
  // Najpierw kasuje poprzednie, potem ustawia nowe.
  async function scheduleAll(list) {
    const now = Date.now();
    const C = cap();
    if (C) {
      try {
        await C.cancel({ notifications: ALL_IDS.map(id => ({ id })) });
        const toSchedule = list
          .filter(n => n.at > now + 5000)
          .map(n => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at) } }));
        if (toSchedule.length) await C.schedule({ notifications: toSchedule });
      } catch (e) {}
      return;
    }
    // Przeglądarka: setTimeout (ograniczone — działa póki karta żyje).
    for (const k in webTimers) { clearTimeout(webTimers[k]); delete webTimers[k]; }
    if (!permissionGranted()) return;
    for (const n of list) {
      const delay = n.at - now;
      if (delay <= 0 || delay > 24 * 3600 * 1000) continue; // rozsądny limit dla web
      webTimers[n.id] = setTimeout(() => {
        try { new Notification(n.title, { body: n.body, icon: 'icon.svg', tag: 'kg' + n.id }); } catch (e) {}
      }, delay);
    }
  }

  function cancelAll() { scheduleAll([]); }

  return { requestPermission, permissionGranted, scheduleAll, cancelAll, isApp: () => !!cap() };
})();
