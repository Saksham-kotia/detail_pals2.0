/**
 * DETAIL PALS V2 — Audio Controller
 * =============================================
 * File: src/components/ui/AudioController.tsx
 *
 * Synthesizes a luxury ambient soundtrack in the browser.
 * Plays an Emin9 detuned chord loop with slow lowpass filter sweeps
 * using the Web Audio API. Fades in and out to prevent pops.
 * Starts in a paused state to respect browser autoplay policies.
 */

import { useState, useEffect, useRef } from 'react'

export function AudioController() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const filterNodeRef = useRef<BiquadFilterNode | null>(null)
  const lfoRef = useRef<OscillatorNode | null>(null)
  const lfoGainRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const fadeOutTimeoutRef = useRef<number | null>(null)

  // Emin9 Chord frequencies: E2 (82.41), B2 (123.47), E3 (164.81), G3 (196.00), D4 (293.66), E4 (329.63), F#4 (369.99)
  const frequencies = [82.41, 123.47, 164.81, 196.00, 293.66, 329.63, 369.99]

  const initAudio = () => {
    if (audioCtxRef.current) return

    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioContextClass()
    audioCtxRef.current = ctx

    // Create main volume gain node
    const mainGain = ctx.createGain()
    mainGain.gain.setValueAtTime(0, ctx.currentTime)
    mainGain.connect(ctx.destination)
    gainNodeRef.current = mainGain

    // Create Lowpass Filter
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(450, ctx.currentTime)
    filter.Q.setValueAtTime(2.0, ctx.currentTime)
    filter.connect(mainGain)
    filterNodeRef.current = filter

    // Create LFO to sweep filter frequency slowly
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(0.06, ctx.currentTime) // sweep every ~16.6 seconds

    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(220, ctx.currentTime) // oscillates +/- 220Hz (sweeps 230Hz to 670Hz)

    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()

    lfoRef.current = lfo
    lfoGainRef.current = lfoGain

    // Create warm triangle oscillators for the chord
    const oscs: OscillatorNode[] = []
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      // Detune each note slightly to create a rich chorus/unison texture
      const detuneAmount = (idx % 2 === 0 ? -1 : 1) * (5 + idx * 1.5)
      osc.detune.setValueAtTime(detuneAmount, ctx.currentTime)

      // Individual gain for balancing
      const oscGain = ctx.createGain()
      let volume = 0.08
      if (freq < 150) volume = 0.15 // Deep sub-bass notes
      else if (freq > 300) volume = 0.04 // High sparkle notes

      oscGain.gain.setValueAtTime(volume, ctx.currentTime)

      osc.connect(oscGain)
      oscGain.connect(filter)
      osc.start()
      oscs.push(osc)
    })
    oscillatorsRef.current = oscs
  }

  const playAudio = async () => {
    if (fadeOutTimeoutRef.current) {
      window.clearTimeout(fadeOutTimeoutRef.current)
      fadeOutTimeoutRef.current = null
    }

    try {
      initAudio()
      const ctx = audioCtxRef.current
      const mainGain = gainNodeRef.current

      if (ctx && mainGain) {
        if (ctx.state === 'suspended') {
          await ctx.resume()
        }
        // Smoothly fade in volume to target (0.35)
        const targetVol = 0.35
        mainGain.gain.cancelScheduledValues(ctx.currentTime)
        mainGain.gain.setValueAtTime(mainGain.gain.value, ctx.currentTime)
        mainGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 2.0)
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('Failed to play ambient audio:', err)
    }
  }

  const pauseAudio = () => {
    const ctx = audioCtxRef.current
    const mainGain = gainNodeRef.current

    if (ctx && mainGain) {
      // Smoothly fade out volume
      mainGain.gain.cancelScheduledValues(ctx.currentTime)
      mainGain.gain.setValueAtTime(mainGain.gain.value, ctx.currentTime)
      mainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2)
      setIsPlaying(false)

      // Suspend after fade-out to save CPU/resources
      fadeOutTimeoutRef.current = window.setTimeout(() => {
        if (ctx && ctx.state === 'running') {
          ctx.suspend()
        }
      }, 1300)
    }
  }

  const handleToggle = () => {
    setHasInteracted(true)
    if (isPlaying) {
      pauseAudio()
    } else {
      playAudio()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeOutTimeoutRef.current) {
        window.clearTimeout(fadeOutTimeoutRef.current)
      }

      // Stop oscillators
      try {
        oscillatorsRef.current.forEach(osc => {
          try {
            osc.stop()
          } catch (_) {}
        })
        if (lfoRef.current) {
          try {
            lfoRef.current.stop()
          } catch (_) {}
        }
      } catch (err) {
        console.warn('Error cleanup audio oscillators:', err)
      }

      // Close context
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close()
        } catch (_) {}
      }
    }
  }, [])

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[900]">
      <style>{`
        @keyframes visualizer-bar {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.0); }
        }
        .anim-vis-bar {
          transform-origin: bottom;
          animation: visualizer-bar 0.8s ease-in-out infinite alternate;
        }
      `}</style>
      <button
        onClick={handleToggle}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full border border-dp-border-gold-dim hover:border-dp-border-gold bg-dp-bg/85 backdrop-blur-md shadow-gold-sm hover:shadow-gold-md transition-all duration-300 pointer-events-auto cursor-pointer"
        aria-label={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
      >
        {/* Glowing aura */}
        <div className="absolute inset-0 rounded-full bg-dp-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play/Pause state or Visualizer */}
        {isPlaying ? (
          <div className="flex items-end gap-[3px] h-3">
            <div className="w-[2px] h-3 bg-dp-gold rounded-full anim-vis-bar" style={{ animationDelay: '0.1s', animationDuration: '0.7s' }} />
            <div className="w-[2px] h-3 bg-dp-gold rounded-full anim-vis-bar" style={{ animationDelay: '0.3s', animationDuration: '1.0s' }} />
            <div className="w-[2px] h-3 bg-dp-gold rounded-full anim-vis-bar" style={{ animationDelay: '0.0s', animationDuration: '0.8s' }} />
            <div className="w-[2px] h-3 bg-dp-gold rounded-full anim-vis-bar" style={{ animationDelay: '0.4s', animationDuration: '0.6s' }} />
          </div>
        ) : (
          <svg className="w-4 h-4 text-dp-gold group-hover:scale-110 transition-transform duration-300 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}

        {/* Tooltip */}
        <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <div className="bg-dp-surface-2 border border-dp-border-gold-dim px-3 py-1.5 rounded-none whitespace-nowrap">
            <span className="font-sans text-[11px] font-normal tracking-[0.14em] uppercase text-dp-text-warm">
              {isPlaying ? 'PAUSE AMBIENT' : 'PLAY AMBIENT'}
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}
