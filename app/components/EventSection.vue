<script setup lang="ts">
const event = {
  title: 'After hours,',
  subtitle: 'without limits.',
  date: '2026-11-14',
  dateLabel: 'Saturday, 14 November 2026',
  time: '23:00 — late',
  city: 'Vienna, AT',
  venue: 'Secret location · TBA',
  lineup: ['Klaus Wunderbaum', 'Freestyle Man', 'Tasteless residents']
}
</script>

<template>
  <section id="events" class="events" aria-labelledby="events-heading">
    <div class="events-heading">
      <p class="events-eyebrow">Off the record. On the floor.</p>
      <p class="events-eyebrow">01 / Events</p>
    </div>

    <div class="events-intro">
      <h2 id="events-heading">Next up.</h2>
      <p>Good sound. Bad habits.<br>See you on the dance floor.</p>
    </div>

    <article class="event-card" aria-labelledby="event-title">
      <div class="event-poster" aria-hidden="true">
        <div class="poster-top"><span>Tasteless presents</span><span>TL — 002</span></div>
        <div class="poster-orbit poster-orbit--one" />
        <div class="poster-orbit poster-orbit--two" />
        <div class="poster-orbit poster-orbit--three" />
        <p class="poster-word">AFTER<br>HOURS<span>14.11.26</span></p>
        <div class="poster-bottom"><span>Vienna / All night long</span><span>↗</span></div>
      </div>

      <div class="event-info">
        <div class="event-status"><span class="event-label">Upcoming session</span><span class="event-badge">Mock event</span></div>
        <h3 id="event-title">{{ event.title }}<br>{{ event.subtitle }}</h3>
        <dl class="event-facts">
          <div><dt>When</dt><dd><time :datetime="event.date">{{ event.dateLabel }}</time><span>{{ event.time }}</span></dd></div>
          <div><dt>Where</dt><dd>{{ event.city }}<span>{{ event.venue }}</span></dd></div>
          <div><dt>Lineup</dt><dd>{{ event.lineup.join(' / ') }}</dd></div>
        </dl>
        <details class="event-details">
          <summary>Behind the night <span class="details-icon" aria-hidden="true">+</span></summary>
          <p>A late-night meeting of acid, house and everything in between. Intimate room, extended sets, no rush to go home.</p>
          <p>This is a fictional event preview. The date, venue and lineup are placeholders; tickets are not on sale.</p>
        </details>
        <p class="event-footnote">Tickets & location to be announced.</p>
      </div>
    </article>

    <footer class="events-footer"><a href="#top" aria-label="Tasteless — back to top">Tasteless © 2026</a><span>Independent sound. Vienna.</span><a href="#top">Back to top ↑</a></footer>
  </section>
</template>

<style scoped>
.events {
  padding: clamp(2rem, 5vw, 5rem) clamp(1rem, 3.2vw, 3.4rem) 0;
  scroll-margin-top: 7.5rem;
}
.events-heading, .events-intro, .event-status, .poster-top, .poster-bottom, .events-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.events-eyebrow, .event-label, .event-badge, dt, .poster-top, .poster-bottom, .event-footnote, .events-footer, summary {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  line-height: 1.6;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.events-eyebrow { margin: 0; }
.events-intro { align-items: end; margin: 2.5rem 0; }
h2 { margin: 0; font-size: clamp(3.5rem, 8vw, 8rem); line-height: 0.9; letter-spacing: -0.075em; text-transform: uppercase; }
.events-intro > p { margin: 0; font-size: 0.9rem; line-height: 1.6; }
.event-card { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #fff; }
.event-poster {
  position: relative;
  display: flex;
  min-height: 35rem;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: clamp(1.5rem, 3vw, 3rem);
  color: var(--cream);
  background: var(--red);
  isolation: isolate;
}
.poster-top, .poster-bottom { position: relative; z-index: 1; }
.poster-bottom > span:last-child { font-size: 2rem; line-height: 1; }
.poster-word { z-index: 1; margin: 3rem 0; font-size: clamp(4rem, 7.6vw, 9rem); font-weight: 800; line-height: 0.82; letter-spacing: -0.08em; }
.poster-word > span { display: block; margin-top: 1.5rem; font-family: 'DM Mono', monospace; font-size: clamp(1rem, 2vw, 1.7rem); font-weight: 400; letter-spacing: -0.05em; }
.poster-orbit { position: absolute; z-index: 0; top: 50%; left: 60%; width: 85%; aspect-ratio: 1; border: 1px solid rgba(233, 226, 201, 0.45); border-radius: 50%; transform: translate(-50%, -50%); }
.poster-orbit--two { width: 115%; }
.poster-orbit--three { width: 145%; }
.event-info { display: flex; flex-direction: column; padding: clamp(1.5rem, 3.5vw, 4rem); }
.event-badge { padding: 0.25rem 0.6rem; border: 1px solid var(--line); border-radius: 2rem; white-space: nowrap; }
h3 { margin: 2.25rem 0; font-size: clamp(2rem, 3.3vw, 4rem); line-height: 1; letter-spacing: -0.065em; }
.event-facts { margin: 0 0 2rem; }
.event-facts > div { display: grid; grid-template-columns: 4.5rem 1fr; gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--line); }
dt { padding-top: 0.15rem; }
dd { margin: 0; font-size: 0.85rem; line-height: 1.6; }
dd > span { display: block; opacity: 0.75; }
.event-details { margin-top: auto; border-block: 1px solid var(--line); }
summary { display: flex; min-height: 3.5rem; justify-content: space-between; align-items: center; cursor: pointer; list-style: none; }
summary::-webkit-details-marker { display: none; }
.details-icon { font-size: 1.5rem; }
.event-details[open] .details-icon { transform: rotate(45deg); }
.event-details p { max-width: 34rem; font-size: 0.85rem; line-height: 1.7; }
.event-footnote { margin: 1rem 0 0; font-size: 0.58rem; }
.events-footer { min-height: 7rem; padding-block: 1.5rem; font-size: 0.58rem; }
.events-footer a { display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; }
.events-footer a:hover { text-decoration: underline; text-underline-offset: 0.3em; }
@media (max-width: 760px) {
  .events { scroll-margin-top: 5.8rem; }
  .events-heading { align-items: start; }
  .events-eyebrow { font-size: 0.55rem; }
  .events-intro { align-items: start; flex-direction: column; gap: 1.25rem; margin-block: 2rem; }
  .event-card { grid-template-columns: 1fr; }
  .event-poster { min-height: 26rem; }
  .poster-word { font-size: clamp(4rem, 17vw, 7rem); }
  .event-info { padding: 1.5rem; }
  .event-status { flex-wrap: wrap; }
  h3 { font-size: clamp(2rem, 8vw, 3rem); }
  .events-footer { flex-wrap: wrap; }
  .events-footer > span { display: none; }
}
</style>
