/**
 * O "clack" da máquina de escrever, sintetizado no Web Audio: um estalo de
 * ruído filtrado (o tipo batendo no papel) sobre um baque grave curto (a
 * barra voltando). Cada batida varia um pouco o tom e o volume, para não
 * soar como o mesmo sample repetido. Sem arquivo de áudio.
 *
 * O `AudioContext` só nasce na primeira batida — dentro do keydown, que é o
 * gesto que o navegador exige para liberar som. Sem Web Audio, fica mudo.
 */
export function createClack(): () => void {
  let ctx: AudioContext | null = null
  let noise: AudioBuffer | null = null

  const setup = (): AudioContext | null => {
    if (ctx) return ctx
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
    const length = Math.floor(ctx.sampleRate * 0.08)
    noise = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    return ctx
  }

  return () => {
    const audio = setup()
    if (!audio || !noise) return
    if (audio.state === 'suspended') void audio.resume()

    const now = audio.currentTime
    const vary = (base: number, spread: number) =>
      base * (1 + (Math.random() * 2 - 1) * spread)

    const out = audio.createGain()
    out.gain.value = vary(0.35, 0.15)
    out.connect(audio.destination)

    // Estalo: ruído em banda média-alta, ataque instantâneo, cauda de ~45 ms.
    const click = audio.createBufferSource()
    click.buffer = noise
    click.playbackRate.value = vary(1, 0.08)
    const band = audio.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = vary(2600, 0.15)
    band.Q.value = 1.4
    const clickGain = audio.createGain()
    clickGain.gain.setValueAtTime(1, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)
    click.connect(band).connect(clickGain).connect(out)
    click.start(now)
    click.stop(now + 0.08)

    // Baque: seno grave que cai de tom, um pouco depois do estalo.
    const thump = audio.createOscillator()
    thump.type = 'sine'
    thump.frequency.setValueAtTime(vary(190, 0.1), now)
    thump.frequency.exponentialRampToValueAtTime(70, now + 0.06)
    const thumpGain = audio.createGain()
    thumpGain.gain.setValueAtTime(0.0001, now)
    thumpGain.gain.exponentialRampToValueAtTime(0.6, now + 0.004)
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
    thump.connect(thumpGain).connect(out)
    thump.start(now)
    thump.stop(now + 0.08)
  }
}
