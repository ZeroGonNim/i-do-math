import type { Problem, ProblemTemplate } from '@/types/problem'

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function hashSeed(userId: string, templateId: string, counter: number): number {
  const str = `${userId}::${templateId}::${counter}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function evalConstraint(expr: string, vars: Record<string, number>): boolean {
  const substituted = expr.replace(/\b([a-z])\b/g, (_, k: string) => String(vars[k] ?? 0))
  // 단순 비교 연산만 지원: "x + y < z", "a > b" 등
  const match = substituted.match(/^(.+?)\s*(<|>|<=|>=|===?|!==?)\s*(.+)$/)
  if (!match) return false
  const left = Function(`"use strict"; return (${match[1]})`)() as number
  const right = Function(`"use strict"; return (${match[3]})`)() as number
  const op = match[2]
  if (op === '<') return left < right
  if (op === '>') return left > right
  if (op === '<=') return left <= right
  if (op === '>=') return left >= right
  if (op === '==' || op === '===') return left === right
  if (op === '!=' || op === '!==') return left !== right
  return false
}

export function generateFromTemplate(
  tmpl: ProblemTemplate,
  userId: string,
  counter: number
): Problem {
  const rand = seededRandom(hashSeed(userId, tmpl.templateId, counter))

  for (let attempt = 0; attempt < 100; attempt++) {
    const vars: Record<string, number> = {}
    for (const [key, values] of Object.entries(tmpl.variables)) {
      vars[key] = values[Math.floor(rand() * values.length)]
    }

    const constraintsMet = tmpl.constraints.every(c => evalConstraint(c, vars))

    if (constraintsMet) {
      const question = tmpl.template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k]))
      const b = vars['b'] ?? 1
      const a = vars['a'] ?? 0
      const c = vars['c'] ?? 0
      return {
        id: `${tmpl.templateId}::${counter}`,
        grade: tmpl.grade,
        semester: tmpl.semester,
        unit: tmpl.unit,
        subUnit: '',
        type: tmpl.type,
        difficulty: tmpl.difficulty,
        concept: tmpl.concept,
        skills: tmpl.skills,
        mistakeTypes: tmpl.mistakeTypes,
        question,
        answer: { numerator: a + c, denominator: b },
        steps: [],
        animationAsset: tmpl.animationAsset,
        conceptExplanation: tmpl.conceptExplanation,
      }
    }
  }
  throw new Error(`Cannot generate problem satisfying constraints for ${tmpl.templateId}`)
}
