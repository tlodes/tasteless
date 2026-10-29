<template>
  <section id="events" class="events" aria-label="Kommende Events">
    <div class="event-grid">
      <article class="event-featured" aria-labelledby="event-title">
        <span class="event-pill">Next up</span>
        <h2 id="event-title">After<br>hours</h2>
        <p class="event-meta"><time datetime="2026-11-14T23:00:00+01:00">Sa 14.11.26 · 23:00</time><br>Vienna · Secret location</p>
        <span class="event-preview mono">Event-Vorschau · Termin als Platzhalter</span>
      </article>
      <div class="event-list">
        <article class="event-list-item" aria-label="After Hours, 14. November 2026">
          <time class="event-pill" datetime="2026-11-14">14.11.26</time>
          <h3>After Hours<br><span>Vienna · Secret location</span></h3>
        </article>
        <article v-for="slot in 2" :key="slot" class="event-list-item" aria-label="Weiteres Event wird angekündigt">
          <span class="event-pill">Datum folgt</span>
          <h3>TBA<br><span>Location folgt</span></h3>
        </article>
      </div>
    </div>
    <nav class="event-links" aria-label="Event-Links">
      <a href="#events">Alle Events</a>
      <button type="button" disabled>Tickets <span class="link-note">bald verfügbar</span></button>
      <a href="https://www.instagram.com/tasteless.vie/" target="_blank" rel="noopener noreferrer">Instagram</a>
    </nav>
  </section>
</template>

<style scoped>
.events { max-width: 92rem; margin: 2rem auto 3rem; width: calc(100% - var(--page-gutter) * 2); scroll-margin-top: 2rem; color: var(--ink); }
.event-grid { display: grid; grid-template-columns: 7fr 5fr; }
.event-grid > * { min-width: 0; }
.event-featured { display: flex; min-height: 30rem; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 2rem; padding: 2.5rem var(--page-gutter); }
.event-pill { display: inline-block; align-self: flex-start; border: 1px solid currentColor; border-radius: 999px; padding: 0.3rem 0.85rem; font-size: 1.1rem; font-weight: 700; line-height: 1.2; letter-spacing: -0.025em; }
h2 { margin: 0; font-size: clamp(4rem, 9.7vw, 10rem); line-height: 0.86; font-weight: 800; letter-spacing: -0.075em; text-transform: uppercase; }
.event-meta { margin: 0; font-size: clamp(1rem, 1.65vw, 1.5rem); font-weight: 700; line-height: 1.45; letter-spacing: -0.035em; }
.event-preview { margin-top: -0.8rem; font-size: 0.65rem; line-height: 1.6; }
.event-list { display: flex; flex-direction: column; justify-content: space-between; gap: 2.25rem; padding: 2rem; border-left: 1px solid var(--divider); }
.event-list-item { padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 0.8rem; }
h3 { margin: 0; font-size: clamp(1.1rem, 1.65vw, 1.5rem); font-weight: 700; line-height: 1.3; letter-spacing: -0.035em; }
.event-links { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--divider); }
.event-links > * { display: flex; min-height: 5rem; padding: 1.4rem 1rem; align-items: center; justify-content: center; gap: 0.55rem; text-align: center; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.025em; text-decoration: none; background: none; border: 0; }
.event-links > * + * { border-left: 1px solid var(--divider); }
.event-links a:hover { text-decoration: underline; text-underline-offset: 0.25em; }
.link-note { font-family: 'DM Mono', monospace; font-size: 0.65rem; font-weight: 400; letter-spacing: 0; }
@media (max-width: 760px) {
  .event-grid { grid-template-columns: 1fr; }
  .event-featured { min-height: 29rem; padding-block: 2rem; }
  h2 { font-size: clamp(4.5rem, 18vw, 8rem); }
  .event-list { padding: 2rem var(--page-gutter); border-left: 0; border-top: 1px solid var(--divider); }
  .event-list-item { gap: 0.75rem; }
  .event-links { grid-template-columns: 1fr; }
  .event-links > * { min-height: 4.5rem; }
  .event-links > * + * { border-left: 0; border-top: 1px solid var(--divider); }
}
</style>
