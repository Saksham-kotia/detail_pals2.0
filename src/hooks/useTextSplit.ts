/**
 * useTextSplit — Text split for stagger animation
 * ==================================================
 * Splits a string into word-level spans so each word can be
 * animated independently with Framer Motion's staggerChildren.
 *
 * This is the technique behind the "text assembles itself" effect
 * on the Tingly reference site. Each word enters from below,
 * creating a cascading reveal that feels like the text is being
 * printed by a precision instrument.
 *
 * Usage:
 *   const words = useTextSplit('Your car deserves')
 *   // words = ['Your', 'car', 'deserves']
 *
 *   <motion.h1 variants={staggerContainer(0.04)}>
 *     {words.map((w, i) => (
 *       <motion.span key={i} variants={wordReveal} className="inline-block mr-[0.25em]">
 *         {w}
 *       </motion.span>
 *     ))}
 *   </motion.h1>
 */

export function useTextSplit(text: string, mode: 'words' | 'chars' = 'words'): string[] {
  if (mode === 'chars') {
    return text.split('')
  }
  return text.split(/\s+/).filter(Boolean)
}

/**
 * Splits text into line groups, preserving explicit line breaks.
 * Each element in the returned array is one line.
 */
export function splitLines(text: string): string[] {
  return text.split(/\n|<br\s*\/?>/).map(l => l.trim()).filter(Boolean)
}
