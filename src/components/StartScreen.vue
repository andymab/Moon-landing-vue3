<template>
    <div class="start-screen">
        <div class="content-top">
            <img :src="startMoon" alt="Moon surface" class="bg-img" /> :class="`aspect-${sufixRatio}`" />

            <div class="title-game">
                <h1>Лунная посадка</h1>
                <p class="subtitle">Симулятор посадки космического корабля на Луну</p>
            </div>

            <div class="game-wrapper" v-if="showHelp">
                <div class="game-info">
                    <div class="info-card">
                        <h3 class="info-card-title"><span>Цель игры:</span> <span @click="showHelp = !showHelp"
                                class="close">×</span></h3>
                        <p>Посадить корабль на поверхность Луны с вертикальной скоростью не более 5 м/с</p>
                        <br>
                    </div>

                    <div class="info-card">
                        <h3>Управление</h3>
                        <ul>
                            <li><strong>Мощность</strong>: регулируйте от 0% до 100%</li>
                            <li><strong>Двигатель</strong>:
                                <ul>
                                    <li class="align-center">
                                        <div class="icon">
                                            <svg class="thrust-icon" viewBox="0 0 24 24" width="48" height="48"
                                                xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
                                                <title>Thrust Up</title>
                                                <g fill="none" stroke="currentColor" stroke-width="1.6"
                                                    stroke-linecap="round" stroke-linejoin="round">
                                                    <!-- arrow shaft -->
                                                    <path d="M12 18 V6" />
                                                    <!-- arrow head -->
                                                    <path d="M7.5 10.5 L12 6 L16.5 10.5" />
                                                    <!-- flame / thrust lines -->
                                                    <path
                                                        d="M9.2 19c-.6-1.2-.8-2.6-.4-3.8C9.3 13.4 10.5 12.6 12 12.6s2.7.8 3.2 2.6c.4 1.2.2 2.6-.4 3.8" />
                                                    <path d="M8 21c-.8-1.6-.8-3.2 0-4.6" opacity="0.9" />
                                                    <path d="M16 21c.8-1.6.8-3.2 0-4.6" opacity="0.9" />
                                                </g>
                                            </svg>
                                        </div>
                                        на торможение
                                    </li>
                                    <li class="align-center">
                                        <div class="icon">
                                            <svg class="thrust-icon" viewBox="0 0 24 24" width="48" height="48"
                                                xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
                                                <title>Thrust Down</title>
                                                <g fill="none" stroke="currentColor" stroke-width="1.6"
                                                    stroke-linecap="round" stroke-linejoin="round">
                                                    <!-- arrow shaft -->
                                                    <path d="M12 6v12" />
                                                    <!-- arrow head (down) -->
                                                    <path d="M7.5 13.5 L12 18 L16.5 13.5" />
                                                    <!-- flame / thrust lines (top side for down-thrust) -->
                                                    <path
                                                        d="M9.2 5c-.6 1.2-.8 2.6-.4 3.8C9.3 10.6 10.5 11.4 12 11.4s2.7-.8 3.2-2.6c.4-1.2.2-2.6-.4-3.8" />
                                                    <path d="M8 3c-.8 1.6-.8 3.2 0 4.6" opacity="0.9" />
                                                    <path d="M16 3c.8 1.6.8 3.2 0 4.6" opacity="0.9" />
                                                </g>
                                            </svg>
                                        </div>
                                        на снижение
                                    </li>
                                </ul>
                            </li>
                            <li><strong>Применить</strong>: выполните физическое обновление</li>
                        </ul>
                        <p><strong>Совет:</strong> Начните с мощьность 0%, двигатель
                            <span class="icon">
                                <svg class="thrust-icon" viewBox="0 0 24 24" width="48" height="48"
                                    xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
                                    <title>Thrust Up</title>
                                    <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <!-- arrow shaft -->
                                        <path d="M12 18 V6" />
                                        <!-- arrow head -->
                                        <path d="M7.5 10.5 L12 6 L16.5 10.5" />
                                        <!-- flame / thrust lines -->
                                        <path
                                            d="M9.2 19c-.6-1.2-.8-2.6-.4-3.8C9.3 13.4 10.5 12.6 12 12.6s2.7.8 3.2 2.6c.4 1.2.2 2.6-.4 3.8" />
                                        <path d="M8 21c-.8-1.6-.8-3.2 0-4.6" opacity="0.9" />
                                        <path d="M16 21c.8-1.6.8-3.2 0-4.6" opacity="0.9" />
                                    </g>
                                </svg>

                            </span> и Увеличивайте тягу по мере снижения. Помните, что у Луны есть собственное
                            притяжение, а
                            у
                            твоего корабля масса
                        </p>
                    </div>

                    <div class="info-card">
                        <h3>⚠️ Опасности</h3>
                        <ul>
                            <li>Высокая скорость при посадке → крушение</li>
                            <li>Закончится топливо → не сможете тормозить</li>
                            <li>Улететь в космос → проигрыш</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="start-actions">
            <button class="btn-start" @click="startGame">
                Старт
            </button>

            <button class="btn-help" @click="showHelp = !showHelp">
                Помощь
            </button>
            <button class="btn-start" @click="startGameAuto">
                Автопилот
            </button>
        </div>


    </div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'

const props = defineProps({
    sufixRatio: { type: String }
})

const sufixRatio = toRef(props, 'sufixRatio')

const startMoon = computed(() =>
    `/start-moon${sufixRatio.value}.jpg`
)



const emit = defineEmits(['start', 'start-auto'])

const showHelp = ref(false)

function startGame() { emit('start') }
function startGameAuto() { emit('start-auto') }

</script>
<style scoped>
.start-screen {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    max-width: 100%;
    height: 100%;
    /* видимая высота окна */
    /* height: 100vh;
    height: 100dvh; */
    /* где есть поддержка */
    /* [web:10][web:67] */

    overflow: hidden;
    background: linear-gradient(180deg, #020516, #04102a);
}

/* обёртка для картинки и текста, чтобы не давила низ */
.content-top {
    flex: 1 1 auto;
    position: relative;
}

/* фон */
.bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
}

.full-img {
    /* flex: 1; */
    /* занимает всё доступное пространство */
    width: 100%;
    height: auto;
    object-fit: cover;
}

.full-img.aspect-916 {
    aspect-ratio: 9 / 16;
}


.close {
    color: aliceblue;
    cursor: pointer;
}

.info-card-title {
    display: flex;
    justify-content: space-between;
}

.title-game {
    position: absolute;
    top: clamp(40px, 5vw, 80px);
    /* адаптивный отступ сверху */
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    padding: 0 clamp(16px, 4vw, 26px);
    color: bisque;
    z-index: 2;
}

.game-wrapper {
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 600px;
    z-index: 3;
}

.game-info {
    padding: 40px;
    background-color: rgba(31, 20, 6, 0.831);
    color: rgb(235, 221, 189);
}

.game-info ul {
    padding-left: 20px;

    margin-top: 8px;
    list-style: none;
}

.start-actions {
    flex: 0 0 auto;

    display: flex;
    justify-content: space-around;
    gap: 0.75rem;

    padding: 8px 12px 16px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);

    /* КЛЮЧЕВОЕ: прижатие к низу без absolute */
    margin-top: auto;

    z-index: 5;
}

/* Фиксы для iOS safe-area */
@supports (padding: max(0px)) {
    .start-actions {
        padding-bottom: max(16px, env(safe-area-inset-bottom));
    }
}

.align-center {
    display: flex;
    align-items: center;
}

.icon svg {
    width: 32px;
    height: 32px;
}

.btn-start,
.btn-help {
    font-size: 1rem;
    margin-right: 1rem;
    /* line-height: 1.45; */
    cursor: pointer;
    text-transform: uppercase;
    /* padding: 4px; */
}

.buttons button {
    margin-right: 8px
}

button {
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(31, 20, 6, 0.831);
    color: #fff;
    border: none
}
</style>