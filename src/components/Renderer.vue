<template>
    <div class="viewport" :class="viewportClass">
        <template v-if="fuel && altitude > 0">
            <svg class="background" viewBox="0 0 1200 650" preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="sun">
                        <stop offset="0%" stop-color="#fff6c2" />
                        <stop offset="100%" stop-color="#ffd27a" stop-opacity="0.08" />
                    </radialGradient>
                </defs>

                <rect width="1200" height="650" fill="#020516" />
                <g v-for="(s, i) in stars" :key="i">
                    <circle :cx="s.x" :cy="s.y + bgOffset" :r="s.r" fill="#fff" :opacity="s.o" />
                </g>

                <circle :cx="sunX" :cy="sunY" r="90" fill="url(#sun)" :opacity="0.22" />
            </svg>

            <!-- Контейнер поверхности Луны (40% высоты, прижат к низу) -->
            <div class="moon-surface-container">
                <!-- Картинка поверхности, которая поднимается -->
                <img :src="moonSurfaceImage" alt="Moon surface" class="surface-img" :style="surfaceImageStyle" />
            </div>

            <!-- Rocket (absolute) -->
            <div class="ship" :style="shipStyle" aria-hidden="false">
                <svg width="90" height="260" viewBox="0 0 90 200" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(45,100)">
                        <ellipse cx="0" cy="-20" rx="14" ry="42" fill="#e6e6e6" stroke="#999" />
                        <rect x="-16" y="-66" width="32" height="36" rx="8" fill="#cfcfcf" stroke="#999" />
                        <polygon points="-16,-66 0,-90 16,-66" fill="#d6d6d6" stroke="#999" />
                        <path d="M-16,6 L-40,26 L-16,36 Z" fill="#c33" />
                        <path d="M16,6 L40,26 L16,36 Z" fill="#c33" />

                        <!-- Main engine flame (bottom) - PNG/WebP версия -->
                        <g v-if="engine === 'retro' && thrust > 0" :style="{ opacity: flameOpacity }"
                            class="flame-main">
                            <!-- Используем foreignObject для HTML-контента -->
                            <foreignObject x="-20" y="28" width="40" height="40">
                                <img xmlns="http://www.w3.org/1999/xhtml" :src="flameImage" alt="Engine flame"
                                    :style="flameStyle" />
                            </foreignObject>
                        </g>

                        <!-- Retro engine flame (top) -->
                        <g v-if="engine === 'main' && thrust > 0" transform="translate(0,-100)"
                            :style="{ opacity: flameOpacity }" class="flame-retro">
                            <foreignObject x="-15" y="-28" width="30" height="30">
                                <img xmlns="http://www.w3.org/1999/xhtml" :src="retroFlameImage"
                                    alt="Retro engine flame" :style="flameStyle" />
                            </foreignObject>
                        </g>

                    </g>
                </svg>
            </div>

        </template>
        <template v-if="fuel == 0">
            <img :src="fuelEmty" class="full-img" :style="surfaceImageStyle" />
        </template>
        <template v-else-if="altitude <= 0 && velocity < 5">
            <img :src="success_landing" class="full-img" :style="surfaceImageStyle" />
        </template>
        <template v-else>
            <img :src="crash_landing" class="full-img" :style="surfaceImageStyle" />
        </template>
        <template v-if="fuel && altitude > 0">
            <Hud :altitude="altitude" :velocity="velocity" :fuel="fuel" :turn="turn" />
        </template>
    </div>
</template>

<script setup>
//main  * (1 + thrust * 0.3)
//Retro * (1 + thrust * 0.2)
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import Hud from './Hud.vue'

const ratio = ref(window.innerWidth / window.innerHeight)

const updateRatio = () => {
    ratio.value = window.innerWidth / window.innerHeight
}
onMounted(() => {
    window.addEventListener('resize', updateRatio)
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateRatio)
})

const viewportClass = computed(() => {
    if (ratio.value > 1.7) return 'ratio-169'
    if (ratio.value > 1.45) return 'ratio-43'
    return 'ratio-916'
})


const moonSurfaceImage = '/moon-surface.png'
const fuelEmty = '/fuel-empty.png'
const success_landing = '/success-landing.png'
const crash_landing = '/crash-landing.png'

import flameImage from '/flame.png' // или flame.webp
import retroFlameImage from '/flame-retro.png'




const props = defineProps({
    altitude: Number,
    velocity: Number,
    thrust: Number,
    engine: String,
    maxAltitude: { type: Number, default: 1200 },
    fuel: Number,
    turn: Number,
})

const flameStyle = computed(() => ({
    width: '100%',
    height: `100%`,
    objectFit: 'contain',
    objectPosition: 'top',
    filter: `brightness(${1 + props.thrust * 0.02})`,
    transition: 'all 0.1s ease-out'
}))


// stable stars
const stars = Array.from({ length: 120 }, (_, i) => ({
    x: (i * 73) % 1200 + 10,
    y: ((i * 37) % 500) + 10,
    r: (i % 5) / 3 + 0.3,
    o: 0.5 + ((i % 7) / 14)
}))

const sunX = 140
const sunY = 140
const viewportH = 650 // высота viewport

// Параметры поверхности
const CONTAINER_HEIGHT_PERCENT = 40 // 40% от высоты viewport
const CONTAINER_HEIGHT = viewportH * (CONTAINER_HEIGHT_PERCENT / 100) // 305px при viewportH=764

// Вычисляем положение верхней границы поверхности (surfaceY)
const surfaceY = computed(() => {
    const alt = Math.max(0, Math.min(props.maxAltitude, props.altitude ?? props.maxAltitude))
    const t = alt / props.maxAltitude // 1 = высоко, 0 = низко

    // Начальное значение top должно быть таким, чтобы было видно только 10% изображения
    // Если CONTAINER_HEIGHT = 260px, то 10% от 260px = 26px
    // Значит top должен быть: CONTAINER_HEIGHT - видимаяЧасть = 260 - 26 = 234px

    const VISIBLE_PERCENT_AT_START = 0.1 // 10%
    const START_TOP = CONTAINER_HEIGHT * (1 - VISIBLE_PERCENT_AT_START) // 234px

    // Конечное значение top = 0 (вся поверхность видна)
    const END_TOP = 0

    // Линейная интерполяция
    return START_TOP * t + END_TOP * (1 - t)

    // Или проще:
    // return CONTAINER_HEIGHT * (1 - VISIBLE_PERCENT_AT_START) * t
})

// Вычисляем прогресс от 0 до 1 (0 - далеко, 1 - близко)
const surfaceProgress = computed(() => {
    const alt = Math.max(0, Math.min(props.maxAltitude ?? 1200, props.altitude ?? (props.maxAltitude ?? 1200)))
    return 1 - (alt / (props.maxAltitude ?? 1200))
})

const bgOffset = computed(() => {
    const alt = props.altitude ?? props.maxAltitude ?? 1200
    return Math.max(-60, Math.min(60, (props.maxAltitude - alt) * -0.02))
})

const flameOpacity = computed(() => Math.min(1, (props.thrust ?? 0) / 80))

// Стиль для картинки поверхности
const surfaceImageStyle = computed(() => {
    return {
        top: `${surfaceY.value}px`,
        transition: 'top 0.2s ease-out'
    }
})

// Можно динамически менять изображение в зависимости от тяги
const dynamicFlameImage = computed(() => {
    if (props.thrust > 0.8) return highPowerFlameImage
    return flameImage
})



// --- ship positioning: ensure visual contact aligns with physics ---
const shipVisualHeight = 200
const shipBottomOffset = 110
const topY = 10

// landingY = позиция ракеты при посадке
// При посадке ракета должна быть чуть выше поверхности
const landingY = computed(() => {
    // Когда surfaceY = 0 (картинка полностью поднята), ракета должна быть над ней
    const surfaceTop = viewportH - CONTAINER_HEIGHT // верхняя граница контейнера
    const y = surfaceTop - shipBottomOffset
    return Math.max(10, Math.min(y, viewportH - 40))
})

// Позиция ракеты в зависимости от высоты
const shipStyle = computed(() => {
    const maxAlt = props.maxAltitude ?? 1200
    const alt = Math.max(0, Math.min(maxAlt, props.altitude ?? maxAlt))
    const t = alt / maxAlt // 1 = far, 0 = landed

    // Y = landingY + (topY - landingY) * t
    const y = landingY.value + (topY - landingY.value) * t

    return {
        transform: `translate(-45px, ${y}px)`,
        transition: 'transform 0.2s ease-out',
        zIndex: 3
    }
})
</script>

<style scoped>
.viewport {
    /* position: relative;
    width: 100%;
    height: 650px;
    max-width: 1100px;
    margin-top: 12px;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
    background: linear-gradient(180deg, #020516, #04102a); */

    position: relative;
    width: 100%;
    max-width: 1100px;

    /* <-- гарантирует точное соотношение сторон */

    /* margin-top: 12px; */
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
    background: linear-gradient(180deg, #020516, #04102a);

}

.ratio-916 {
    aspect-ratio: 9 / 16;
}

.ratio-169 {
    aspect-ratio: 16 / 9;
}

.ratio-43 {
    aspect-ratio: 4 / 3;
}

.background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: 1;
}

/* Контейнер поверхности Луны - 40% высоты, прижат к низу */
.moon-surface-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    /* 40% от высоты viewport */
    z-index: 2;
    overflow: hidden;
    /* Скрываем то, что выходит за границы */
    background: transparent;
    /* Прозрачный фон */
}

.full-img {
    height: 100%;


}

/* Картинка поверхности - изначально скрыта снизу */
.surface-img {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
    /* Сохраняем пропорции */
    min-height: 100%;
    /* Минимум на всю высоту контейнера */
    object-fit: cover;
    /* Заполняем контейнер, обрезая при необходимости */
    object-position: top;
    /* Важная часть изображения сверху */
    pointer-events: none;
    z-index: 2;

    /* top: -300px;
    transition: top 0.2s ease-out; */
}

.ship {
    position: absolute;
    left: 50%;
    width: 90px;
    height: 240px;
    pointer-events: none;
    z-index: 3;
    will-change: transform;
}

.flame-image {
    animation: flameFlicker 0.3s infinite alternate;
    transform-origin: center bottom;
}

.flame-image.retro {
    animation: flameFlickerRetro 0.3s infinite alternate;
    transform-origin: center top;
}

/* Анимация пламени */
@keyframes flameFlicker {
    0% {
        transform: scaleY(1);
    }

    100% {
        transform: scaleY(1.15);
    }
}

@keyframes flameFlickerRetro {
    0% {
        transform: scaleY(1) rotate(180deg);
    }

    100% {
        transform: scaleY(1.1) rotate(180deg);
    }
}
</style>