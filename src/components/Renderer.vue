<template>
    <div class="viewport" :class="viewportClass">
        <template v-if="fuel && altitude > 0">
            <SpaceSun class="space-wrapper" />

            <!-- Контейнер поверхности Луны (40% высоты, прижат к низу) -->
            <div class="moon-surface-container">
                <!-- Картинка поверхности, которая поднимается -->
                <img :src="moonSurfaceImage" alt="Moon surface" class="surface-img" :style="surfaceImageStyle" />
            </div>

            <!-- Rocket (absolute) -->
            <div class="ship" :style="shipStyle" aria-hidden="false">
                <svg width="90" height="260" viewBox="0 0 180 400" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(90,200)">

                        <!-- Корпус -->
                        <ellipse cx="0" cy="-20" rx="14" ry="42" fill="#e6e6e6" stroke="#999" />

                        <rect x="-16" y="-66" width="32" height="36" rx="8" fill="#cfcfcf" stroke="#999" />

                        <polygon points="-16,-66 0,-90 16,-66" fill="#d6d6d6" stroke="#999" />

                        <!-- Боковые двигатели -->
                        <path d="M-16,6 L-40,26 L-16,36 Z" fill="#c33" />
                        <path d="M16,6 L40,26 L16,36 Z" fill="#c33" />

                        <!-- 🔥 Основной двигатель (вниз) -->
                        <g v-if="engine === 'retro' && thrust > 0" class="flame flame-main" :style="flameSvgStyle">

                            <image :href="flameImage" x="-20" y="36" width="40" height="60"
                                preserveAspectRatio="xMidYMin meet" />
                        </g>

                        <!-- 🔥 Ретро-двигатель (вверх) -->
                        <g v-if="engine === 'main' && thrust > 0" class="flame flame-retro" :style="flameSvgStyle"
                            transform="translate(0,-120) rotate(0)">

                            <image :href="retroFlameImage" x="-15" y="0" width="30" height="45"
                                preserveAspectRatio="xMidYMin meet" />
                        </g>

                    </g>
                </svg>
            </div>

        </template>
        <template v-if="fuel == 0">
            <img :src="fuelEmty" class="full-img" />
        </template>
        <template v-else-if="altitude <= 0 && velocity <= 5">
            <img :src="success_landing" class="full-img" />
        </template>
        <template v-else-if="altitude <= 0 && velocity > 5">
            <img :src="crash_landing" class="full-img" />
        </template>
        <template v-if="fuel && altitude > 0">
            <Hud :altitude="altitude" :velocity="velocity" :fuel="fuel" :turn="turn" />
        </template>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, toRef } from 'vue'
import Hud from './Hud.vue'
import SpaceSun from './background/SpaceSun.vue'


const props = defineProps({
    altitude: Number,
    velocity: Number,
    thrust: Number,
    engine: String,
    maxAltitude: { type: Number, default: 1200 },
    fuel: Number,
    turn: Number,
    sufixRatio: { type: String }
})


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


const sufixRatio = toRef(props, 'sufixRatio')

const moonSurfaceImage = '/moon-surface.png'
const fuelEmty = computed(() =>
    `/fuel-empty${sufixRatio.value}.jpg`
)

const success_landing = computed(() =>
    `/success-landing${sufixRatio.value}.jpg`
)

const crash_landing = computed(() =>
    `/crash-landing${sufixRatio.value}.jpg`
)

import flameImage from '/flame.png' // или flame.webp
import retroFlameImage from '/flame-retro.png'


const flameStyle = computed(() => ({
    width: '100%',
    height: `100%`,
    objectFit: 'contain',
    objectPosition: 'top',
    filter: `brightness(${1 + props.thrust * 0.02})`,
    transition: 'all 0.1s ease-out'
}))

const flameOpacity = computed(() => Math.min(1, (props.thrust ?? 0) / 80))

const flameSvgStyle = computed(() => ({
    opacity: flameOpacity.value,
    // transform: `scaleY(${0.7 + props.thrust * 0.3})`

}))


const viewportH = 650 // высота viewport

// Параметры поверхности

const CONTAINER_HEIGHT = computed(() => {
    const percent = window.innerWidth <= 768
        ? (viewportClass.value === 'ratio-916' ? 35 : 14)
        : (viewportClass.value === 'ratio-916' ? 40 : 16);
    return 650 * (percent / 100); // viewportH теперь тоже внутри computed
});

// Вычисляем положение верхней границы поверхности (surfaceY)
const surfaceY = computed(() => {
    const alt = Math.max(0, Math.min(props.maxAltitude, props.altitude ?? props.maxAltitude))
    const t = alt / props.maxAltitude // 1 = высоко, 0 = низко

    // Начальное значение top должно быть таким, чтобы было видно только 10% изображения
    // Если CONTAINER_HEIGHT = 260px, то 10% от 260px = 26px
    // Значит top должен быть: CONTAINER_HEIGHT - видимаяЧасть = 260 - 26 = 234px

    const VISIBLE_PERCENT_AT_START = 0.1 // 10%
    const START_TOP = CONTAINER_HEIGHT.value * (1 - VISIBLE_PERCENT_AT_START) // 234px

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
    const surfaceTop = viewportH - CONTAINER_HEIGHT.value // верхняя граница контейнера
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
    flex: 1 1 auto;
    position: relative;
}

/* Предотвращаем выделение и контекстное меню */
.viewport-wrapper * {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
}

/* Отключаем стандартное поведение касаний для изображений */
.viewport img {
    -webkit-touch-callout: none;
    pointer-events: none;
}


/* Соотношения сторон */
.ratio-916 {
    /* aspect-ratio: 9 / 16; */
}

.ratio-169 {
    /* aspect-ratio: 16 / 9; */
}

.ratio-43 {
    /* aspect-ratio: 4 / 3; */
}

.space-wrapper {
    width: 100%;
    height: 100%;
    display: block;
    z-index: 1;
    /* Фикс для iOS */
    -webkit-tap-highlight-color: transparent;
    touch-action: none;
}

.moon-surface-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    z-index: 2;
    overflow: hidden;
    background: transparent;
    /* Запрещаем взаимодействие, которое может вызвать зум */
    touch-action: none;
}

.full-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Предотвращаем drag & drop на iOS */
    -webkit-user-select: none;
    -webkit-touch-callout: none;
}

.surface-img {
    position: absolute;
    left: 0;
    width: 100%;
    min-height: 100%;
    /* object-fit: contain; */
    object-position: top;
    pointer-events: none;
    z-index: 2;

    /* Отключаем стандартное поведение изображений на iOS */
    -webkit-touch-callout: none;
    -webkit-user-drag: none;
}

.ship {
    position: absolute;
    top: 0;
    left: 50%;
    width: 90px;
    height: 260px;
    pointer-events: none;
    z-index: 3;
}

.flame image {
    transform-origin: center top;
}
.flame-main image {
    filter: drop-shadow(0 0 6px rgba(255,140,0,0.6));
}

.flame-retro image {
    filter: drop-shadow(0 0 6px rgba(255,200,120,0.6));
}

/* Добавить медиа-запросы для мобильных */
@media (max-width: 768px) {
    .viewport {
        /* height: 100%;
        max-height: calc(100vh - env(safe-area-inset-bottom, 0px)); */
        /* Дополнительные фиксы для iOS */
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;

    }

    .moon-surface-container {
        height: 35%;
        /* Уменьшаем высоту поверхности на мобильных */
    }

    .ratio-916 {
        /* aspect-ratio: 9 / 18; */
        /* Более узкое на мобильных */
    }

    .ratio-169,
    .ratio-43 {
        /* aspect-ratio: 16 / 10; */
    }



    /* Отключаем стандартные жесты iOS */
    .viewport {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
    }

    .full-img {
        height: 70dvh;
    }
}

@media (max-width: 480px) {
    .moon-surface-container {
        height: 30%;
    }

}

/* Фикс для Samsung Internet */
@supports (-webkit-touch-callout: none) and (not (-webkit-overflow-scrolling: touch)) {
    .viewport {
        /* height: -webkit-fill-available; */
    }
}

</style>