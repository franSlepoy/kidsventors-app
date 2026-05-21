import { useState, useCallback, useMemo } from 'react'
import { ROBOTS, ACHIEVEMENTS, getPlayerLevel, getNodeStatus } from '../data/robotTree'
import confetti from 'canvas-confetti'

const STORAGE_KEY = id => `kv-progress-${id}`

function loadProgress(studentId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(studentId))
    if (raw) return JSON.parse(raw)
  } catch {}
  return { completedNodes: [], achievements: [], totalXP: 0 }
}

function saveProgress(studentId, progress) {
  try {
    localStorage.setItem(STORAGE_KEY(studentId), JSON.stringify({
      ...progress,
      lastUpdated: new Date().toISOString(),
    }))
  } catch {}
}

export function useStudentProgress(studentId) {
  const [state, setState] = useState(() => loadProgress(studentId))

  const completedSet = useMemo(() => new Set(state.completedNodes), [state.completedNodes])

  const nodeStatus = useCallback(
    nodeId => getNodeStatus(nodeId, completedSet),
    [completedSet]
  )

  const completeNode = useCallback((nodeId) => {
    const node = ROBOTS[nodeId]
    if (!node) return
    if (completedSet.has(nodeId)) return

    setState(prev => {
      const newCompleted  = [...prev.completedNodes, nodeId]
      const newXP         = prev.totalXP + (node.xp || 0)
      const newAchievements = [...prev.achievements]

      // Auto-unlock achievements
      if (newCompleted.length === 1 && !newAchievements.includes('thats-a-start')) {
        newAchievements.push('thats-a-start')
      }
      if (newCompleted.length >= 20 && !newAchievements.includes('elder-crafter')) {
        newAchievements.push('elder-crafter')
      }
      if (node.isCertificate && node.course === 'inicial' && !newAchievements.includes('level-up')) {
        newAchievements.push('level-up')
      }
      if (node.isCertificate && node.course === 'intermedia' && !newAchievements.includes('seen-it-all')) {
        newAchievements.push('seen-it-all')
      }
      if (node.isCreative && !newAchievements.includes('into-unknown')) {
        newAchievements.push('into-unknown')
      }
      if (newAchievements.length >= 10 && !newAchievements.includes('determined')) {
        newAchievements.push('determined')
      }
      if (newAchievements.length >= 20 && !newAchievements.includes('collector')) {
        newAchievements.push('collector')
      }

      const next = { completedNodes: newCompleted, achievements: newAchievements, totalXP: newXP }
      saveProgress(studentId, next)

      // Celebration
      if (node.isCertificate) {
        fireCertificateConfetti()
      } else {
        fireNodeConfetti(node.rarity)
      }

      return next
    })
  }, [studentId, completedSet])

  const uncompleteNode = useCallback((nodeId) => {
    setState(prev => {
      const newCompleted = prev.completedNodes.filter(id => id !== nodeId)
      const node = ROBOTS[nodeId]
      const newXP = Math.max(0, prev.totalXP - (node?.xp || 0))
      const next = { ...prev, completedNodes: newCompleted, totalXP: newXP }
      saveProgress(studentId, next)
      return next
    })
  }, [studentId])

  const unlockAchievement = useCallback((achievementId) => {
    setState(prev => {
      if (prev.achievements.includes(achievementId)) return prev
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
      const newXP = prev.totalXP + (achievement?.xp || 0)
      const next = {
        ...prev,
        achievements: [...prev.achievements, achievementId],
        totalXP: newXP,
      }
      saveProgress(studentId, next)
      return next
    })
  }, [studentId])

  const levelInfo  = useMemo(() => getPlayerLevel(state.totalXP), [state.totalXP])
  const courseProgress = useMemo(() => {
    const total     = Object.values(ROBOTS).filter(r => r.course === 'inicial' && !r.isBonus).length
    const completed = state.completedNodes.filter(id => {
      const r = ROBOTS[id]; return r && r.course === 'inicial' && !r.isBonus
    }).length
    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [state.completedNodes])

  return {
    completedNodes: completedSet,
    achievements:   state.achievements,
    totalXP:        state.totalXP,
    levelInfo,
    courseProgress,
    nodeStatus,
    completeNode,
    uncompleteNode,
    unlockAchievement,
  }
}

// ── Confetti helpers ────────────────────────────────────────────────

function fireNodeConfetti(rarity) {
  const colors = {
    common:    ['#a78bfa', '#38bdf8', '#ffffff'],
    rare:      ['#fbbf24', '#a78bfa', '#00ff87'],
    epic:      ['#ec4899', '#a78bfa', '#fbbf24', '#00e5ff'],
    legendary: ['#fbbf24', '#ffffff', '#ffd700', '#ff6600'],
  }
  const c = colors[rarity] || colors.common
  confetti({
    particleCount: rarity === 'legendary' ? 200 : rarity === 'epic' ? 120 : 60,
    spread:        rarity === 'legendary' ? 120 : 80,
    origin:        { x: 0.5, y: 0.5 },
    colors:        c,
    gravity:       0.8,
  })
}

function fireCertificateConfetti() {
  const burst = (x, spread) => confetti({
    particleCount: 180,
    spread,
    origin:        { x, y: 0.4 },
    colors:        ['#fbbf24', '#ffffff', '#ffd700', '#a78bfa', '#00e5ff', '#ff69b4'],
    gravity:       0.7,
    scalar:        1.3,
  })
  burst(0.25, 70)
  setTimeout(() => burst(0.75, 70), 150)
  setTimeout(() => burst(0.5, 120), 300)
}
