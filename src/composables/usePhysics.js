import { ref } from 'vue'

export function usePhysics(opts = {}) {
    const G_MOON = opts.g ?? 1.62
    const MASS = opts.mass ?? 1500
    const MAX_THRUST = opts.maxThrust ?? 4500
    const MAX_CONSUMPTION = opts.maxConsumption ?? 5
    const MAX_ALT = opts.maxAltitude ?? (opts.startAltitude ?? 1200)

    console.log(G_MOON, MASS, MAX_THRUST, MAX_CONSUMPTION, MAX_ALT);

    const altitude = ref(opts.startAltitude ?? 1000)
    const velocity = ref(opts.startVelocity ?? 0) // положительная = вниз, отрицательная = вверх
    const fuel = ref(opts.startFuel ?? 500)

    // Состояния для звуков
    const soundEvents = ref([]) // Массив звуковых событий за последний шаг
    const hasFuel = ref(true)
    const isEngineActive = ref(false)
    const lastThrottle = ref(0)


    function step({ throttlePct = 0, engine = 'retro', dt = 1 }) {

        // Очищаем звуковые события предыдущего шага
        soundEvents.value = []

        const throttle = Math.max(0, Math.min(100, throttlePct)) / 100

        // Определяем, активен ли двигатель (для звука)
        const engineWasActive = isEngineActive.value
        isEngineActive.value = throttle > 0 && fuel.value > 0
        lastThrottle.value = throttlePct

        // Звуковое событие: запуск/остановка двигателя
        if (engineWasActive !== isEngineActive.value) {
            if (isEngineActive.value) {
                soundEvents.value.push({ type: 'engine_start', engine })
            } else {
                soundEvents.value.push({ type: 'engine_stop', engine })
            }
        }

        // Звуковое событие: изменение тяги
        if (Math.abs(throttlePct - lastThrottle.value) > 10) {
            soundEvents.value.push({
                type: 'thrust_change',
                engine,
                throttle: throttlePct
            })
        }

        // Если нет тяги, просто применяем гравитацию
        if (throttle <= 0 || fuel.value <= 0) {

            // Проверяем, закончилось ли топливо
            const fuelWasAvailable = hasFuel.value
            hasFuel.value = fuel.value > 0

            if (fuelWasAvailable && !hasFuel.value) {
                soundEvents.value.push({ type: 'fuel_empty' })
            }

            // Только гравитация
            velocity.value += G_MOON * dt
            altitude.value -= velocity.value * dt

            if (altitude.value <= 0) {
                const impactVelocity = velocity.value
                altitude.value = 0
                //velocity.value = 0

                // Звуковые события посадки/крушения
                if (Math.abs(impactVelocity) > 3) {
                    soundEvents.value.push({
                        type: 'crash',
                        velocity: impactVelocity
                    })
                } else {
                    soundEvents.value.push({ type: 'landing_success' })
                }

                return {
                    altitude: altitude.value,
                    velocity: impactVelocity,
                    fuel: fuel.value,
                    landed: true,
                    crashed: Math.abs(impactVelocity) > 3,
                    soundEvents: [...soundEvents.value]
                }
            }

            return {
                altitude: altitude.value,
                velocity: velocity.value,
                fuel: fuel.value,
                landed: false,
                soundEvents: [...soundEvents.value],
                engineActive: isEngineActive.value,
                throttlePct: 0,
                engineType: engine
            }
        }



        // Вычисляем расход топлива
        const fuelNeeded = throttle * MAX_CONSUMPTION * dt
        const fuelUsed = Math.min(fuel.value, fuelNeeded)
        fuel.value -= fuelUsed

        // Эффективная тяга пропорциональна использованному топливу
        const effectiveThrottle = fuelUsed / (MAX_CONSUMPTION * dt)
        const actualF = effectiveThrottle * MAX_THRUST
        const a_thrust = actualF / MASS

        // Отладочная информация
        console.log(`Throttle: ${throttle}, FuelUsed: ${fuelUsed}, EffectiveThrottle: ${effectiveThrottle}, Thrust: ${actualF}, a_thrust: ${a_thrust}`)


        // Сила тяжести всегда направлена вниз (к поверхности)
        // Main двигатель толкает вниз, retro - вверх
        let a_thrust_direction = 0

        if (engine === 'main') {

            // Main двигатель добавляет ускорение вниз (положительное)
            a_thrust_direction = a_thrust
        } else if (engine === 'retro') {
            // Retro двигатель добавляет ускорение вверх (отрицательное)
            a_thrust_direction = -a_thrust
        }

        // Суммарное ускорение
        const a_total = G_MOON + a_thrust_direction

        console.log(`Gravity: ${G_MOON}, ThrustDir: ${a_thrust_direction}, TotalAccel: ${a_total}`)


        // Интегрируем скорость
        velocity.value += a_total * dt

        // Интегрируем высоту (положительная скорость уменьшает высоту)
        altitude.value -= velocity.value * dt

        console.log(`New velocity: ${velocity.value}, New altitude: ${altitude.value}`)

        // Звуковое событие: критические параметры
        if (altitude.value < 100 && Math.abs(velocity.value) > 10) {
            soundEvents.value.push({
                type: 'critical_descent',
                altitude: altitude.value,
                velocity: velocity.value
            })
        }

        // Обработка посадки
        if (altitude.value <= 0) {
            const impactVelocity = velocity.value
            altitude.value = 0
            //velocity.value = 0

            // Звуковые события посадки/крушения
            if (Math.abs(impactVelocity) > 3) {
                soundEvents.value.push({
                    type: 'crash',
                    velocity: impactVelocity
                })
            } else {
                soundEvents.value.push({ type: 'landing_success' })
            }

            return {
                altitude: altitude.value,
                velocity: impactVelocity,
                fuel: fuel.value,
                landed: true,
                crashed: Math.abs(impactVelocity) > 3, // критическая скорость посадки
                soundEvents: [...soundEvents.value],
                engineActive: false,
                throttlePct: 0,
                engineType: engine
            }
        }

        // Обнаружение выхода за пределы
        if (altitude.value > MAX_ALT * 10) {
            soundEvents.value.push({ type: 'escape_atmosphere' })
            return {
                altitude: altitude.value,
                velocity: velocity.value,
                fuel: fuel.value,
                landed: false,
                escaped: true,
                soundEvents: [...soundEvents.value],
                engineActive: isEngineActive.value,
                throttlePct,
                engineType: engine
            }
        }

        return {
            altitude: altitude.value,
            velocity: velocity.value,
            fuel: fuel.value,
            landed: false,
            soundEvents: [...soundEvents.value],
            engineActive: isEngineActive.value,
            throttlePct,
            engineType: engine
        }
    }

    // Функция для получения текущего состояния
    function getState() {
        let direction = 'hovering'
        if (velocity.value > 0.1) direction = 'descending'
        else if (velocity.value < -0.1) direction = 'ascending'

        return {
            altitude: altitude.value,
            velocity: velocity.value,
            fuel: fuel.value,
            direction: direction,
            engineActive: isEngineActive.value,
            lastThrottle: lastThrottle.value,
            hasFuel: hasFuel.value
        }
    }

    // Функция для удобства: определяет, приближаемся ли мы к поверхности
    function isDescending() {
        return velocity.value > 0.1
    }

    // Функция для удобства: определяем, удаляемся ли от поверхности
    function isAscending() {
        return velocity.value < -0.1
    }

    function reset() {
        altitude.value = opts.startAltitude ?? 1000
        velocity.value = opts.startVelocity ?? 0
        fuel.value = opts.startFuel ?? 500
        soundEvents.value = []
        hasFuel.value = true
        isEngineActive.value = false
        lastThrottle.value = 0
    }

    return {
        altitude,
        velocity,
        fuel,
        step,
        reset,
        getState,
        isDescending,
        isAscending,
        soundEvents,
        hasFuel,
        isEngineActive
    }
}