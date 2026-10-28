<script setup lang="ts">
const player = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const playbackError = ref(false)

const togglePlayback = async () => {
  if (!player.value) return
  playbackError.value = false
  if (player.value.paused) {
    try {
      await player.value.play()
    } catch {
      isPlaying.value = false
      playbackError.value = true
    }
  } else {
    player.value.pause()
  }
}

const seekBy = (seconds: number) => {
  if (!player.value || !Number.isFinite(player.value.duration)) return
  player.value.currentTime = Math.min(player.value.duration, Math.max(0, player.value.currentTime + seconds))
}
</script>

<template>
  <div class="site-shell">
    <svg class="logo-filter" aria-hidden="true">
      <filter id="red-only" color-interpolation-filters="sRGB" x="-5%" y="-5%" width="110%" height="110%">
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1
                  0 0 0 0 .19
                  0 0 0 0 .31
                  0 0 0 1 0"
        />
      </filter>
    </svg>

    <main id="top">
      <section class="hero" aria-label="Tasteless – interaktives DJ-Pult">
        <h1 class="visually-hidden">Tasteless — Good sound. Bad habits.</h1>
        <header class="site-header">
          <nav class="site-nav" aria-label="Hauptnavigation">
            <span class="nav-meta">Vienna</span>
            <a class="nav-logo" href="#top" aria-label="Tasteless – Startseite">
              <img src="/brand/tasteless-logo.png?v=2" alt="Tasteless">
            </a>
            <div class="nav-links">
              <a class="nav-link" href="#events">Events</a>
              <a class="nav-link nav-playground" href="#playground">Playground</a>
              <button class="pill-button nav-ticket" type="button" disabled title="Tickets bald verfügbar">Tickets <span class="visually-hidden">– bald verfügbar</span></button>
            </div>
          </nav>
        </header>

        <div id="playground" class="hero-stage" tabindex="-1" aria-label="DJ-Pult: drehen, Play drücken oder am Jog-Wheel scrubben">
          <ClientOnly>
            <HeroScene
              :is-playing="isPlaying"
              @toggle-playback="togglePlayback"
              @seek-by="seekBy"
            />
            <template #fallback>
              <div class="scene-fallback" aria-label="3D-Modell wird vorbereitet" />
            </template>
          </ClientOnly>
        </div>

        <div class="hero-bottom">
          <button
            class="play-control mono"
            :class="{ 'is-playing': isPlaying }"
            type="button"
            :aria-label="isPlaying ? 'Musik pausieren' : 'Musik starten'"
            :aria-pressed="isPlaying"
            @click="togglePlayback"
          >
            <span class="play-indicator" aria-hidden="true" />
            {{ isPlaying ? 'Pause drücken' : 'Play drücken' }}
          </button>
          <a class="text-link mono events-cue" href="#events">↓ Events</a>
          <a class="text-link mono playground-link" href="#playground">Playground ↗</a>
        </div>
        <p v-if="playbackError" class="playback-error" role="alert">Musik konnte nicht gestartet werden. Bitte erneut versuchen.</p>
        <audio
          ref="player"
          preload="metadata"
          src="/audio/klaus-wunderbaum-trix.mp3"
          @play="isPlaying = true"
          @pause="isPlaying = false"
          @ended="isPlaying = false"
        />
      </section>

      <EventSection />

      <div class="marquee" aria-hidden="true">
        <div class="marquee-track">
          <div v-for="copy in 2" :key="copy" class="marquee-group">
            <template v-for="repeat in 2" :key="repeat">
              <span>After hours 14.11</span><span class="marquee-dot">●</span>
              <span>Tasteless</span><span class="marquee-dot">●</span>
              <span>Vienna</span><span class="marquee-dot">●</span>
            </template>
          </div>
        </div>
      </div>

      <section class="statement" aria-label="Good sound. Bad habits.">
        <div class="statement-inner">
          <h2><span>Good</span> <span>sound.</span><br><span>Bad</span> <span>habits.</span></h2>
          <a class="pill-button" href="https://www.instagram.com/tasteless.vie/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <div class="newsletter">
          <label class="visually-hidden" for="newsletter-email">E-Mail für Newsletter – bald verfügbar</label>
          <div class="newsletter-controls">
            <input id="newsletter-email" type="email" placeholder="deine@mail.at" disabled aria-describedby="newsletter-note">
            <button class="pill-button" type="button" disabled>Newsletter</button>
          </div>
          <p id="newsletter-note" class="footer-note">Newsletter bald verfügbar.</p>
        </div>
        <nav class="footer-links mono" aria-label="Footer">
          <a class="text-link" href="https://www.instagram.com/tasteless.vie/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <span class="footer-placeholder">Impressum <small>folgt</small></span>
        </nav>
      </div>
    </footer>
  </div>
</template>
