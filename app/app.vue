<script setup lang="ts">
const player = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const togglePlayback = async () => {
  if (!player.value) return
  if (player.value.paused) {
    try {
      await player.value.play()
    } catch {
      isPlaying.value = false
    }
  } else {
    player.value.pause()
  }
}

const updateProgress = () => {
  if (!player.value) return
  currentTime.value = player.value.currentTime
  duration.value = Number.isFinite(player.value.duration) ? player.value.duration : 0
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

const progress = computed(() => duration.value ? Math.min(100, (currentTime.value / duration.value) * 100) : 0)

const seekBy = (seconds: number) => {
  if (!player.value || !Number.isFinite(player.value.duration)) return
  player.value.currentTime = Math.min(player.value.duration, Math.max(0, player.value.currentTime + seconds))
  updateProgress()
}
</script>

<template>
  <div class="site-shell">
    <svg class="logo-filter" aria-hidden="true">
      <filter id="red-only" color-interpolation-filters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1
                  0 0 0 0 .19
                  0 0 0 0 .31
                  1.5 -.75 -.75 0 0"
        />
      </filter>
    </svg>

    <header class="site-header">
      <nav class="site-nav" aria-label="Hauptnavigation">
        <span class="nav-meta">Vienna / 2026</span>
        <a class="nav-logo" href="#top" aria-label="Tasteless – Startseite">
          <img src="/brand/tasteless-logo.png?v=2" alt="Tasteless">
        </a>
        <div class="nav-links">
          <a class="nav-link" href="#top">Sound</a>
          <a class="nav-link" href="#events">Events <span aria-hidden="true">↗</span></a>
        </div>
      </nav>
    </header>

    <main id="top">
      <section class="hero" aria-labelledby="track-title">
        <div class="hero-kicker" aria-hidden="true">
          <span>TL — 001</span>
          <span>Interactive sound object</span>
        </div>

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

        <div id="player" class="player-panel">
          <p class="track-label">Featured track</p>
          <h1 id="track-title">Klaus Wunderbaum</h1>
          <p class="track-title">Trix <span>(Freestyle Man Bad Acid Mix)</span></p>

          <div class="player-controls">
            <p class="deck-control-state" :class="{ 'is-playing': isPlaying }">
              <span aria-hidden="true" />
              {{ isPlaying ? 'Playing' : 'Play am Controller drücken' }}
            </p>

            <div class="timeline" aria-hidden="true">
              <span class="timeline__fill" :style="{ width: `${progress}%` }" />
            </div>
            <p class="timecode">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</p>
          </div>
        </div>

        <p class="drag-hint" aria-hidden="true"><span>↔</span> Deck drehen / Jog-Wheel scrubben</p>

        <button
          class="accessible-play"
          type="button"
          :aria-label="isPlaying ? 'Musik pausieren' : 'Musik starten'"
          :aria-pressed="isPlaying"
          @click="togglePlayback"
        >
          {{ isPlaying ? 'Musik pausieren' : 'Musik starten' }}
        </button>

        <audio
          ref="player"
          preload="metadata"
          src="/audio/klaus-wunderbaum-trix.mp3"
          @play="isPlaying = true"
          @pause="isPlaying = false"
          @ended="isPlaying = false"
          @loadedmetadata="updateProgress"
          @timeupdate="updateProgress"
        />
      </section>

      <EventSection />
    </main>
  </div>
</template>
