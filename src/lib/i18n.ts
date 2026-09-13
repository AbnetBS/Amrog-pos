"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/** Native English ⇄ አማርኛ language layer.  It is deliberately local-first:
 * no third-party script ever rewrites React-owned nodes, form values, or order
 * data — Google's engine runs SERVER-side (/api/translate) and only sends back
 * plain strings, so the menu UI can never be damaged by translation.
 *
 * Translation tiers (first match wins):
 *   1. STRINGS / MENU_AM / CATEGORY_AM — hand-tuned dictionaries, instant & offline
 *   2. Google auto-translation of ANY other text (owner-added menu items,
 *      categories, announcements, settings texts) — cached in localStorage +
 *      the `translations` DB table, so it is instant after the first time. */

export type Lang = "en" | "am";

const STORAGE_KEY = "fana_lang";

/* ───────────────────────── persistence ───────────────────────── */

export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "am" || saved === "en") return saved;
  } catch {}
  return "en";
}

const LANG_EVENT = "fana-lang-change";

export function setLang(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
  // Same-tab listeners (storage events only fire in OTHER tabs).
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: lang }));
}

function subscribeLang(cb: () => void) {
  window.addEventListener(LANG_EVENT, cb);
  window.addEventListener("storage", cb); // other tabs
  return () => {
    window.removeEventListener(LANG_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const serverSnapshot: Lang = "en";

/** Reactive hook: [lang, changeLang]. Syncs across every open tab. */
export function useLang(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribeLang, getLang, () => serverSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const change = useCallback((l: Lang) => {
    setLang(l);
  }, []);

  return [lang, change];
}

/* ───────────────────────── dictionaries ───────────────────────── */

const STRINGS = {
  en: {
    /* customer menu — loading / chrome */
    menu_label: "Menu",
    loading_menu: "Loading menu...",
    loading_sub: "Your table's chicken is on the way 🍗",
    intro: "🍗 Welcome to Amrogn Chicken. Order from your table: pick your chicken, add notes, then Send Order. No waiting for a waiter, your food goes straight to the kitchen.",
    search_ph: "Search shawarma, chicken, burgers...",
    waiter: "Waiter",

    /* customer menu — items */
    add: "Add",
    details: "Details",
    out_of_stock: "Out of Stock",
    description: "Description",
    add_to_order: "Add to Order",
    sale: "SALE",
    you_save: "You save",
    until: "until",
    nothing_found: "Nothing found in this category. Please ask a waiter if the menu looks incomplete.",

    /* customer menu — cart & submit */
    review_order: "Review Order",
    review_your_order: "Review Your Order",
    submit_order: "Submit Order",
    sending: "Sending...",
    remove: "Remove",
    note_ph: "📝 Note: No onions, extra garlic sauce, spicy...",
    items_label: "item(s)",
    err_submit: "Could not submit order. Please call your waiter.",
    err_connection: "Connection issue. Press Submit again. Your order will NOT be sent twice.",
    err_menu_updated: "The menu was just updated. Please re-add your items and submit again.",
    tap_to_add_offer: "Tap to add offer",
    offer_added: "Offer added",
    offer_unavailable: "Offer unavailable",
    special_applied: "Special applied",
    special_quantities_fixed: "Offer quantities are fixed",
    remove_special: "Remove offer",
    free: "FREE",
    view_photo: "View photo",
    close_gallery: "Close gallery",
    previous_photo: "Previous photo",
    next_photo: "Next photo",

    /* customer menu — confirmation */
    order_sent_title: "Order Request Sent!",
    waiting_confirmation: "Waiting for Waiter Confirmation",
    waiter_walking:
      "Your waiter is walking to {table} to confirm your order. Once confirmed, preparation starts immediately.",
    add_more_note: "Want to add more? You can order again anytime, it joins your table's bill automatically.",
    back_to_menu: "← Back to Menu",

    /* customer menu — live order status (feature 1) */
    order_status: "Order Status",
    os_view: "View",
    os_arrived: "Arrived",
    os_just_now: "just now",
    os_minutes_short: "{n} min",
    os_phase_none: "No order yet",
    os_phase_waiting: "Waiting for your waiter to confirm",
    os_phase_confirmed: "Order accepted → heading to the kitchen",
    os_phase_preparing: "Your food is being prepared 👨‍🍳",
    os_phase_ready: "Your food is ready! ✅",
    os_phase_drinks: "Your drinks are on the way 🥤",
    os_phase_bill: "Your bill is on its way",
    os_phase_paid: "Paid • thank you!",
    os_phase_cancelled: "Order cancelled",
    os_bill_requested_short: "Bill requested",
    os_no_order_title: "Your order",
    os_no_order: "No order yet. Add items and tap Send Order, your status will appear here.",
    os_auto_refresh: "Auto-updates",
    os_refresh_now: "Refresh now",
    os_kitchen: "Kitchen",
    os_ready_label: "ready",
    os_barista_note:
      "{count} drink item(s) are prepared at the drinks station and arrive right away",
    os_your_items: "Your items",
    os_total: "Total",
    os_line_accepted: "Accepted",
    os_line_preparing: "Preparing",
    os_line_done: "Ready",
    os_line_cooking: "Cooking",
    os_line_queued: "Queued",
    os_sending: "Sending…",
    os_request_bill: "Request the bill / receipt",
    os_bill_after_food: "You can ask for the bill here as soon as your food has arrived.",
    os_bill_requested: "✓ Bill requested • a waiter is coming to your table",
    os_bill_requested_at: "Requested at",
    os_rate_visit: "Rate your visit",
    close: "Close",

    /* customer menu — no table */
    scan_qr_title: "Scan a Table QR Code",
    scan_qr_sub: "Please scan the QR code on your table to open your table's ordering menu.",

    /* customer menu — content sections */
    about_us: "🍗 About Amrogn",
    gallery: "Gallery",
    what_we_serve: "✨ What We Serve",
    premium_coffee: "🌯 Famous Shawarma",
    ethiopian_meals: "🍗 Fried & Grilled Chicken",
    fresh_pastries: "🍔 Chicken Burgers",
    fresh_juices: "🥤 Fresh Juices & Drinks",
    find_us: "Find Us",
    open_maps: "Open in Google Maps →",
    what_guests_say: "What Guests Say",
    leave_review: "Leave a Review",
    your_name_ph: "Your name",
    review_q_ph: "How was your chicken today?",
    submit_review: "Submit Review",
    reviews_note: "Reviews appear after owner approval.",
    review_need_name: "Please add your name and a short comment.",
    review_thanks: "✓ Thank you! Your review awaits admin approval before it appears.",
    review_fail: "Couldn't submit right now. Please tell a waiter.",
    /* the review is the LAST step of the guest flow (feature 5) */
    review_cta_title: "Enjoyed your visit?",
    review_cta_sub: "Two taps below tell other guests how we did, it means a lot to our team.",
    review_thanks_title: "Thank you! 🙏",
    review_thanks_sub:
      "Your review is waiting for admin approval. Once approved it appears here for other guests.",

    /* homepage — nav */
    nav_home: "Home",
    nav_about: "About",
    nav_menu: "Menu",
    nav_services: "Why Amrogn",
    nav_gallery: "Gallery",
    nav_reviews: "Reviews",
    nav_find_us: "Find Us",

    /* homepage — hero */
    hero_open_daily: "Open Daily",
    hero_cta_menu: "Explore Menu & Prices",
    hero_cta_location: "Find Us / Scan QR",
    hero_hl_brews: "Since 2018",
    hero_hl_macchiato: "Famous Chicken Shawarma",
    hero_hl_juices: "Crispy Fried Chicken",
    hero_hl_spris: "Fire-Grilled & Roasted",
    hero_hl_dining: "Tandoor Mofo",
    hero_hl_sandwich: "Chicken Burgers & Combos",
    hero_hl_reviews: "Google Reviews",

    /* homepage — sections */
    sec_menu: "Crispy, Grilled & Wrapped Fresh",
    sec_why: "Made For Flavor, Speed & Sharing",
    sec_how: "How Service Works",
    sec_gallery: "Moments at Amrogn Chicken",
    sec_location: "Visit Amrogn at 4 Kilo, Ambassador Mall",
    sec_faq: "Frequently Asked Questions",
    sec_reviews: "What Guests Say About Amrogn Chicken",

    /* homepage — CTA banner */
    cta_badge: "Visit Amrogn Chicken Today",
    cta_title: "Famous Shawarma. Crispy Chicken. Ready When You Are.",
    cta_sub: "Scan your table QR, order in English or Amharic, and watch your shawarma and fried or grilled chicken go straight to the kitchen.",
    cta_menu: "Explore Our Menu",
    cta_call: "Call",
    cta_find: "Find Us (4 Kilo)",

    /* homepage — footer */
    footer_quick_links: "Quick Links",
    fl_home: "Home",
    fl_about: "About Amrogn Chicken",
    fl_why: "Why Choose Us",
    fl_menu: "Full Menu & Prices",
    fl_services: "Table Service",
    fl_gallery: "Photo Gallery",
    footer_hours: "Opening Hours & Contact",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    footer_rights: "All Rights Reserved.",

    /* homepage — full menu section */
    menu_badge_full: "Our Full Menu",
    menu_browse_sub:
      "Browse the full Amrogn Chicken menu: famous shawarma, roasted, grilled and tandoor mofo chicken, crispy fried chicken, burgers, family meals, combos and drinks. All prices in Ethiopian Birr (ETB).",
    search_menu_ph: "Search shawarma, mofo, burger, fried chicken...",
    clear_search: "Clear",
    showing_items: "Showing {n} items",
    reset_filter: "Reset Category Filter",
    no_match_title: "No menu items match your search",
    no_match_sub: "Try clearing your search term or selecting another category.",
    show_all: "Show All Menu Items",
    sold_out: "Sold Out",
    unavailable: "Unavailable",
    prep_time_label: "Prep Time:",
    dietary_features: "Dietary & Features",
    call_waiter_order: "Call your waiter to order this item",
    includes_warmth: "Made fresh at the 4 Kilo branch",

    /* homepage — reviews section */
    write_review: "Write a Review",
  },

  am: {
    /* customer menu — loading / chrome */
    menu_label: "ምናሌ",
    loading_menu: "ምናሌ በመጫን ላይ...",
    loading_sub: "የጠረጴዛዎ ዶሮ በመንገድ ላይ ነው 🍗",
    intro: "🍗 እንኳን ወደ አምሮኝ ቺክን በደህና መጡ ፣ ከጠረጴዛዎ ይዘዙ፣ ዶሮዎን ይምረጡ፣ ማስታወሻ ይጨምሩና ትዕዛዝ ላክ፤ አስተናጋጅ መጠበቅ ሳያስፈልግ ትዕዛዝዎ በቀጥታ ወደ ኩሽና ይሄዳል።",
    search_ph: "ሻወርማ፣ ዶሮ፣ በርገር ፈልግ...",
    waiter: "ሰራተኛ",

    /* customer menu — items */
    add: "ጨምር",
    details: "ዝርዝር",
    out_of_stock: "አልቋል",
    description: "መግለጫ",
    add_to_order: "ወደ ትዕዛዝ ጨምር",
    sale: "ቅናሽ",
    you_save: "ቆጥበዋል",
    until: "እስከ",
    nothing_found: "በዚህ ምድብ ምንም አልተገኘም፣ ምናሌው ያልተሟላ ከሆነ እባክዎ ሰራተኛ ይጠይቁ።",

    /* customer menu — cart & submit */
    review_order: "ትዕዛዝ ገምግም",
    review_your_order: "ትዕዛዝዎን ይገምግሙ",
    submit_order: "ትዕዛዝ ላክ",
    sending: "በመላክ ላይ...",
    remove: "አስወግድ",
    note_ph: "📝 ማስታወሻ፡ ሽንኩርት የለም፣ ነጭ ሶስ ይብዛ፣ ቅመም...",
    items_label: "እቃዎች",
    err_submit: "ትዕዛዝ መላክ አልተቻለም። እባክዎ ሰራተኛ ይጥሩ።",
    err_connection: "የግንኙነት ችግር፣ እንደገና ይላኩ። ትዕዛዝዎ ሁለት ጊዜ አይላክም።",
    err_menu_updated: "ምናሌው አሁን ተዘምኗል፣ እባክዎ ዕቃዎችዎን እንደገና ጨምረው ይላኩ።",
    tap_to_add_offer: "ቅናሹን ለመጨመር ይጫኑ",
    offer_added: "ቅናሹ ተጨምሯል",
    offer_unavailable: "ቅናሹ አልተገኘም",
    special_applied: "ልዩ ቅናሽ ተተግብሯል",
    special_quantities_fixed: "የቅናሹ ብዛት ቋሚ ነው",
    remove_special: "ቅናሹን አስወግድ",
    free: "በነጻ",
    view_photo: "ፎቶ ይመልከቱ",
    close_gallery: "ጋለሪን ዝጋ",
    previous_photo: "ያለፈው ፎቶ",
    next_photo: "ቀጣዩ ፎቶ",

    /* customer menu — confirmation */
    order_sent_title: "ትዕዛዝ ተልኳል!",
    waiting_confirmation: "የሰራተኛ ማረጋገጫ በመጠበቅ ላይ",
    waiter_walking: "ሰራተኛው ትዕዛዝዎን ለማረጋገጥ ወደ {table} እየመጣ ነው። ከተረጋገጠ በኋላ ወዲያውኑ ይዘጋጃል።",
    add_more_note: "ተጨማሪ መጨመር ይፈልጋሉ? በማንኛውም ጊዜ እንደገና ማዘዝ ይችላሉ፣ በራስ-ሰር ከጠረጴዛዎ ሂሳብ ጋር ይጣመራል።",
    back_to_menu: "← ወደ ምናሌ ተመለስ",

    /* customer menu — live order status (feature 1) */
    order_status: "የትዕዛዝ ሁኔታ",
    os_view: "ይመልከቱ",
    os_arrived: "የደረሰበት",
    os_just_now: "አሁን",
    os_minutes_short: "{n} ደቂቃ",
    os_phase_none: "እስካሁን ትዕዛዝ የለም",
    os_phase_waiting: "ሰራተኛው እንዲያረጋግጥ በመጠባበቅ ላይ",
    os_phase_confirmed: "ትዕዛዝዎ ተቀብሏል → ወደ ኩሽና ገብቷል",
    os_phase_preparing: "ምግብዎ እየተዘጋጀ ነው 👨‍🍳",
    os_phase_ready: "ምግብዎ ዝግጁ ነው! ✅",
    os_phase_drinks: "መጠጦችዎ በመንገድ ላይ ናቸው 🥤",
    os_phase_bill: "ሂሳብዎ እየመጣ ነው",
    os_phase_paid: "ተከፍሏል • እናመሰግናለን!",
    os_phase_cancelled: "ትዕዛዙ ተሰርዟል",
    os_bill_requested_short: "ሂሳብ ተጠይቋል",
    os_no_order_title: "ትዕዛዝዎ",
    os_no_order: "እስካሁን ትዕዛዝ የለም። እቃዎችን ጨምረው «ትዕዛዝ ላክ» ይንኩ፣ ሁኔታው እዚህ ይታያል።",
    os_auto_refresh: "በራሱ ይዘምናል",
    os_refresh_now: "አሁን አድስ",
    os_kitchen: "ኩሽና",
    os_ready_label: "ዝግጁ",
    os_barista_note: "{count} የመጠጥ እቃዎች በመጠጥ ጣቢያ ይዘጋጃሉ፣ ወዲያውኑ ይደርሳሉ",
    os_your_items: "እቃዎችዎ",
    os_total: "ጠቅላላ",
    os_line_accepted: "ተቀብሏል",
    os_line_preparing: "በዝግጅት ላይ",
    os_line_done: "ዝግጁ",
    os_line_cooking: "በመዘጋጀት ላይ",
    os_line_queued: "በወረፋ",
    os_sending: "በመላክ ላይ…",
    os_request_bill: "ሂሳብ / ደረሰኝ ይላኩልን",
    os_bill_after_food: "ምግብዎ እንደደረሰ ሂሳቡን እዚህ መጠየቅ ይችላሉ።",
    os_bill_requested: "✓ ሂሳብ ተጠይቋል • ሰራተኛ ወደ ጠረጴዛዎ እየመጣ ነው",
    os_bill_requested_at: "የተጠየቀበት ሰዓት",
    os_rate_visit: "ስለ አገልግሎታችን ግምገማ ይስጡ",
    close: "ዝጋ",

    /* customer menu — no table */
    scan_qr_title: "የጠረጴዛ QR ኮድ ይቃኙ",
    scan_qr_sub: "የጠረጴዛዎን የትዕዛዝ ምናሌ ለመክፈት በጠረጴዛዎ ላይ ያለውን QR ኮድ ይቃኙ።",

    /* customer menu — content sections */
    about_us: "🍗 ስለ አምሮኝ",
    gallery: "ጋለሪ",
    what_we_serve: "✨ የምናቀርባቸው",
    premium_coffee: "🌯 ታዋቂ ሻወርማ",
    ethiopian_meals: "🍗 የተጠበሰና የተጋገረ ዶሮ",
    fresh_pastries: "🍔 የዶሮ በርገር",
    fresh_juices: "🥤 ትኩስ ጭማቂና መጠጦች",
    find_us: "ያግኙን",
    open_maps: "በGoogle ካርታ ይክፈቱ →",
    what_guests_say: "እንግዶች ምን ይላሉ",
    leave_review: "ግምገማ ይተው",
    your_name_ph: "ስምዎ",
    review_q_ph: "የዛሬው ዶሮዎ እንዴት ነበር?",
    submit_review: "ግምገማ ላክ",
    reviews_note: "ግምገማዎች ከባለቤት ፈቃድ በኋላ ይታያሉ።",
    review_need_name: "እባክዎ ስምዎን እና አጭር አስተያየት ይጨምሩ።",
    review_thanks: "✓ እናመሰግናለን! ግምገማዎ ከመታየቱ በፊት የአስተዳዳሪ ፈቃድ ይጠብቃል።",
    review_fail: "አሁን መላክ አልተቻለም። እባክዎ ለሰራተኛ ይንገሩ።",
    /* the review is the LAST step of the guest flow (feature 5) */
    review_cta_title: "ጉብኝትዎ ደስ አለዎት?",
    review_cta_sub: "ከታች በሁለት ንክኪ ለሌሎች እንግዶች ይንገሩ፣ ለቡድናችን ትልቅ ትርጉም አለው።",
    review_thanks_title: "እናመሰግናለን! 🙏",
    review_thanks_sub: "ግምገማዎ የአስተዳዳሪ ፈቃድ እየጠበቀ ነው፤ ከጸደቀ በኋላ ለሌሎች እንግዶች እዚህ ይታያል።",

    /* homepage — nav */
    nav_home: "መነሻ",
    nav_about: "ስለ እኛ",
    nav_menu: "ምናሌ",
    nav_services: "ለምን አምሮኝ",
    nav_gallery: "ጋለሪ",
    nav_reviews: "ግምገማዎች",
    nav_find_us: "ያግኙን",

    /* homepage — hero */
    hero_open_daily: "በየቀኑ ክፍት",
    hero_cta_menu: "ምናሌ እና ዋጋዎችን ይመልከቱ",
    hero_cta_location: "ያግኙን / QR ይቃኙ",
    hero_hl_brews: "ከ2018 ጀምሮ",
    hero_hl_macchiato: "ታዋቂው የዶሮ ሻወርማ",
    hero_hl_juices: "ጥርት ያለ የተጠበሰ ዶሮ",
    hero_hl_spris: "በእሳት የተጠበሰና የተጋገረ",
    hero_hl_dining: "ታንዱር ሞፎ",
    hero_hl_sandwich: "የዶሮ በርገር እና ኮምቦ",
    hero_hl_reviews: "የGoogle ግምገማዎች",

    /* homepage — sections */
    sec_menu: "ጥርት ያለ፣ የተጠበሰና የተጠቀለለ ትኩስ ምግብ",
    sec_why: "ለጣዕም፣ ለፍጥነትና ለመጋራት የተሰራ",
    sec_how: "አገልግሎት እንዴት እንደሚሰራ",
    sec_gallery: "በአምሮኝ ቺክን ያሉ ጊዜያት",
    sec_location: "አምሮኝን በ4 ኪሎ፣ አምባሳደር ሞል ይጎብኙ",
    sec_faq: "በተደጋጋሚ የሚጠየቁ ጥያቄዎች",
    sec_reviews: "እንግዶች ስለ አምሮኝ ቺክን የሚሉት",

    /* homepage — CTA banner */
    cta_badge: "ዛሬ አምሮኝ ቺክን ይጎብኙ",
    cta_title: "ታዋቂ ሻወርማ። ጥርት ያለ ዶሮ። ሲፈልጉ ዝግጁ።",
    cta_sub: "የጠረጴዛዎን QR ይቃኙ፣ በአማርኛ ወይም በእንግሊዝኛ ይዘዙ፣ ሻወርማዎና የተጠበሰ ዶሮዎ በቀጥታ ወደ ኩሽና ሲሄድ ይመልከቱ።",
    cta_menu: "ምናሌያችንን ይመልከቱ",
    cta_call: "ይደውሉ",
    cta_find: "ያግኙን (4 ኪሎ)",

    /* homepage — footer */
    footer_quick_links: "ፈጣን አገናኞች",
    fl_home: "መነሻ",
    fl_about: "ስለ አምሮኝ ቺክን",
    fl_why: "ለምን እኛን ይመርጣሉ",
    fl_menu: "ሙሉ ምናሌ እና ዋጋዎች",
    fl_services: "የጠረጴዛ አገልግሎት",
    fl_gallery: "የፎቶ ጋለሪ",
    footer_hours: "የስራ ሰዓት እና አድራሻ",
    footer_privacy: "የግላዊነት ፖሊሲ",
    footer_terms: "የአገልግሎት ውሎች",
    footer_rights: "መብቱ በህግ የተጠበቀ ነው።",

    /* homepage — full menu section */
    menu_badge_full: "ሙሉ ምናሌያችን",
    menu_browse_sub:
      "ሙሉ የአምሮኝ ቺክን ምናሌ፣ ታዋቂ ሻወርማ፣ የተጋገረ፣ የተጠበሰና የታንዱር ሞፎ ዶሮ፣ ጥርት ያለ የተጠበሰ ዶሮ፣ በርገር፣ የቤተሰብ ምግቦች፣ ኮምቦ እና መጠጦች። ሁሉም ዋጋዎች በኢትዮጵያ ብር (ETB) ተዘርዝረዋል።",
    search_menu_ph: "ሻወርማ፣ ሞፎ፣ በርገር፣ የተጠበሰ ዶሮ ይፈልጉ...",
    clear_search: "አጽዳ",
    showing_items: "{n} እቃዎች ተገኝተዋል",
    reset_filter: "የምድብ ማጣሪያ ዳግም አስጀምር",
    no_match_title: "ከፍለጋዎ ጋር የሚጣጣም እቃ አልተገኘም",
    no_match_sub: "ፍለጋዎን አጽደው ወይም ሌላ ምድብ ይምረጡ።",
    show_all: "ሁሉንም እቃዎች አሳይ",
    sold_out: "አልቋል",
    unavailable: "አይገኝም",
    prep_time_label: "የማብሰያ ጊዜ፡",
    dietary_features: "የአመጋገብ ልዩ ምልክቶች",
    call_waiter_order: "ይህን እቃ ለማዘዝ ሰራተኛዎን ይጥሩ",
    includes_warmth: "በ4 ኪሎ ቅርንጫፍ ትኩስ ይዘጋጃል",

    /* homepage — reviews section */
    write_review: "ግምገማ ጻፍ",
  },
} as const;

export type StringKey = keyof typeof STRINGS.en;

/** Translator bound to the current language. */
export function useT(): (key: StringKey, vars?: Record<string, string>) => string {
  const [lang] = useLang();
  return useCallback(
    (key: StringKey, vars?: Record<string, string>) => {
      let text: string = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v);
      }
      return text;
    },
    [lang]
  );
}

/** Native display translations for seeded menu data. The database's English values
 * remain canonical identifiers, so changing language never changes an order payload. */
const MENU_AM: Record<string, string> = {
  "Amrogn Chicken": "አምሮኝ ቺክን",
  "Amrogn Chicken - 4 Kilo": "አምሮኝ ቺክን - 4 ኪሎ",
  "Home of Authentic Shawarma": "የትክክለኛ ሻወርማ ቤት",
  "Chicken Shawarma": "የዶሮ ሻወርማ",
  "Special Shawarma": "ልዩ ሻወርማ",
  "Shawarma Plate": "የሻወርማ ሰሃን",
  "Crispy Fried Chicken (2 pcs)": "ጥርት ያለ የተጠበሰ ዶሮ (2 ቁርጥ)",
  "Chicken Fajita": "የዶሮ ፋጂታ",
  "Chicken Kabsa": "የዶሮ ካብሳ",
  "Grilled Quarter Leg": "በእሳት የተጠበሰ ሩብ የዶሮ እግር",
  "Chicken Mofo Quarter Leg": "የዶሮ ሞፎ ሩብ እግር",
  "Roasted Chicken Half": "ግማሽ የተጋገረ ዶሮ",
  "Grilled Double Quarter Leg": "ድርብ ሩብ በእሳት የተጠበሰ ዶሮ",
  "Chicken Mofo Double Quarter Leg": "ድርብ የዶሮ ሞፎ",
  "Roasted Chicken Full": "ሙሉ የተጋገረ ዶሮ",
  "Crispy Chicken Burger": "ጥርት ያለ የዶሮ በርገር",
  "Double Chicken Burger": "ድርብ የዶሮ በርገር",
  "Golden French Fries": "ወርቃማ ፍሬንች ፍራይ",
  "Chicken Nuggets (6 pcs)": "የዶሮ ኑጌት (6)",
  "Fried Chicken Combo": "የተጠበሰ ዶሮ ኮምቦ",
  "Shawarma Combo": "የሻወርማ ኮምቦ",
  "Fried Chicken Bucket (8 pcs)": "የተጠበሰ ዶሮ ባልዲ (8 ቁርጥ)",
  "Crispy Family Box": "የቤተሰብ ጥርት ያለ ዶሮ ቦክስ",
  "Shawarma Family Box": "የቤተሰብ የሻወርማ ቦክስ",
  "Soft Drink (Coca, Sprite, Fanta)": "ለስላሳ መጠጥ (ኮካ፣ ስፕራይት፣ ፋንታ)",
  "Mineral Water": "የማዕድን ውሃ",
  "Fresh Mango / Orange Juice": "ትኩስ የማንጎ/ብርቱካን ጭማቂ",
  "Avocado-Mango Spris": "አቮካዶ-ማንጎ ስፕሪስ",
  "Spicy Crispy Chicken Burger": "ቅመም ያለው ጥርት ያለ የዶሮ በርገር",
  "Cheesy Special Shawarma": "አይብ ያለው ልዩ ሻወርማ",
  "Famous Chicken Shawarma": "ታዋቂው የዶሮ ሻወርማ",
  "Crispy Fried Chicken": "ጥርት ያለ የተጠበሰ ዶሮ",
  "Fire-Grilled & Roasted": "በእሳት የተጠበሰና የተጋገረ",
  "Tandoor Mofo": "ታንዱር ሞፎ",
  "Chicken Burgers & Combos": "የዶሮ በርገር እና ኮምቦ",
  "Famous Shawarma": "ታዋቂ ሻወርማ",
  "Fried & Grilled Chicken": "የተጠበሰና በእሳት የተጠበሰ ዶሮ",
  "Chicken Burgers": "የዶሮ በርገሮች",
  "Fresh Juices & Drinks": "ትኩስ ጭማቂዎችና መጠጦች",
};

const CATEGORY_AM: Record<string, string> = {
  all: "ሁሉም",
  shawarma: "ሻወርማ",
  chicken: "ዶሮ",
  burgers: "የዶሮ በርገር",
  sides: "ጎን ምግቦች",
  combos: "ኮምቦ",
  "family-meals": "የቤተሰብ ምግቦች",
  drinks: "መጠጦች",
  "fresh-juices": "ትኩስ ጭማቂዎች",
  specials: "ልዩ ምግቦች",
  // legacy cafe-era slugs kept so old rows still render Amharic
  soup: "ሾርባ", burger: "በርገር", pasta: "ፓስታ", salad: "ሰላጣ", pizza: "ፒዛ", rice: "ሩዝ",
  "hot-drinks": "ትኩስ መጠጦች", "soft-drinks": "ለስላሳ መጠጦች", juices: "ጭማቂዎች", sandwich: "ሳንድዊች", "snack-and-wrap": "ቀላል ምግቦች", "ethiopian-traditional-meals": "የዶሮ ምግቦች", "pastry-and-cakes": "ጎን ምግቦች",
};

/* ───────────── Google-powered auto-translation for dynamic text ─────────────
 * Anything not covered by the dictionaries above (menu items the owner adds
 * later, new categories, announcements, settings texts…) is translated by the
 * SAME Google engine as the Google Translate widget — but through OUR server
 * (/api/translate). Google never touches the page DOM, so:
 *   • no banner/toolbar ever pops up over the menu
 *   • React never crashes ("removeChild" errors are impossible)
 *   • form values, cart data and order payloads stay canonical English
 *
 * Flow: components call tx(text) → cache hit? show it : show English and
 * register the string → one debounced batched request per view → results are
 * merged (state bump) and every component re-renders with Amharic. Results
 * are persisted in localStorage for instant repeat loads.
 */

const TX_STORAGE_KEY = "fana_tx_am";
const TX_FLUSH_DELAY_MS = 600;
const TX_BATCH_MAX = 120;
const TX_STORAGE_MAX_ENTRIES = 1500;

const GE_EZ_RE = /[\u1200-\u137F]/; // Amharic script already

function txTranslatable(text: string): boolean {
  if (!text || text.length > 1500) return false;
  if (GE_EZ_RE.test(text)) return false;
  return /[a-z]/i.test(text); // needs at least one Latin letter
}

let txCache: Record<string, string> | null = null; // lazy from localStorage
const txRequested = new Set<string>(); // this tab already asked / received
const txQueue = new Set<string>();
const txListeners = new Set<() => void>();
let txVersion = 0;
let txTimer: ReturnType<typeof setTimeout> | null = null;
let txInFlight = false;

function txLoad(): Record<string, string> {
  if (txCache) return txCache;
  txCache = {};
  try {
    const raw = window.localStorage.getItem(TX_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") txCache = parsed as Record<string, string>;
    }
  } catch {}
  return txCache;
}

function txPersist(): void {
  try {
    const entries = Object.entries(txCache ?? {});
    const trimmed = entries.slice(-TX_STORAGE_MAX_ENTRIES); // keep the newest
    window.localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {} // quota/private mode — cache just stays in memory
}

function txEmit(): void {
  txVersion += 1;
  for (const cb of txListeners) cb();
}

function txSubscribe(cb: () => void): () => void {
  txListeners.add(cb);
  return () => txListeners.delete(cb);
}

const txServerSnapshot = 0;
function txGetVersion(): number {
  return txVersion;
}

async function txFlush(): Promise<void> {
  if (txInFlight || txQueue.size === 0) return;
  txInFlight = true;
  const batch = [...txQueue].slice(0, TX_BATCH_MAX);
  for (const s of batch) txQueue.delete(s);
  try {
    const r = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: "am", texts: batch }),
    });
    if (r.ok) {
      const data = await r.json();
      const map = data?.translations;
      let changed = false;
      if (map && typeof map === "object") {
        const cache = txLoad();
        for (const [k, v] of Object.entries(map as Record<string, string>)) {
          if (typeof v === "string" && v) {
            if (cache[k] !== v) changed = true;
            cache[k] = v;
          }
        }
        // every requested string is marked done — even ones Google couldn't
        // translate — so we never re-ask for the same text in this tab.
        for (const s of batch) txRequested.add(s);
        if (changed) {
          txPersist();
          txEmit();
        }
      }
    }
  } catch {
    // offline / server down → keep showing English; retry next registration
  } finally {
    txInFlight = false;
    if (txQueue.size > 0) txSchedule(); // leftovers (batch > TX_BATCH_MAX)
  }
}

function txSchedule(): void {
  if (txTimer) return;
  txTimer = setTimeout(() => {
    txTimer = null;
    void txFlush();
  }, TX_FLUSH_DELAY_MS);
}

function txLookup(text: string): string | undefined {
  if (txCache) return txCache[text];
  return undefined;
}

/** Register a string for auto-translation (only acts when lang = am). */
function txRegister(text: string): void {
  if (!txTranslatable(text)) return;
  txLoad();
  if (txCache?.[text] || txRequested.has(text)) return;
  txRequested.add(text);
  txQueue.add(text);
  txSchedule();
}

/** Best current Amharic for `text` (dictionaries first, then auto-cache). */
function txBest(text: string): string {
  if (!text) return text;
  const lower = text.toLowerCase();
  const manual =
    MENU_AM[text] ?? CATEGORY_AM[lower] ?? CATEGORY_AM[lower.replace(/\s+/g, "-")];
  if (manual) return manual;
  const hit = txLookup(text);
  if (hit) return hit;
  txRegister(text);
  return text;
}

/**
 * Hook: reactive translator for DYNAMIC content (menu items, categories,
 * announcements, settings strings). Returns text unchanged in English mode.
 */
export function useAutoT(): (text: string) => string {
  const [lang] = useLang();
  useSyncExternalStore(txSubscribe, txGetVersion, () => txServerSnapshot);
  return useCallback(
    (text: string) => (lang === "am" ? txBest(text) : text),
    [lang]
  );
}

export function useMenuText() {
  const [lang] = useLang();
  useSyncExternalStore(txSubscribe, txGetVersion, () => txServerSnapshot);
  return useCallback((text: string, category = false) => {
    if (lang !== "am" || !text) return text;
    if (category && CATEGORY_AM[text.toLowerCase()]) return CATEGORY_AM[text.toLowerCase()];
    return txBest(text);
  }, [lang]);
}
