import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROBOTS, EDGES, COURSES, CATEGORY, NODE_SIZE, CANVAS_W } from '../../data/robotTree'
import { useStudentProgress } from '../../hooks/useStudentProgress'

const R    = NODE_SIZE / 2                  // node radius
const CURSO = 'inicial'                     // active course
const BASE  = import.meta.env.BASE_URL      // '/kidsventors-app/'

// ── Edge path (cubic bezier, upward tree) ───────────────────────────
function edgePath(from, to) {
  const x1 = from.x, y1 = from.y - R
  const x2 = to.x,   y2 = to.y + R
  const cy = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`
}

// ── Rarity ring colors ───────────────────────────────────────────────
const RARITY_RING = {
  common:    '#a78bfa',
  rare:      '#fbbf24',
  epic:      '#ec4899',
  legendary: '#ffd700',
}

// ── Single Node ──────────────────────────────────────────────────────
function TreeNode({ node, status, isSelected, onClick }) {
  const cat  = CATEGORY[node.category] || CATEGORY.mechanics
  const ring = RARITY_RING[node.rarity] || '#a78bfa'

  const baseColor = status === 'completed' ? (node.color || cat.color) : status === 'available' ? cat.color : '#2d2d4e'
  const opacity   = status === 'locked' ? 0.28 : 1

  return (
    <motion.g
      onClick={() => status !== 'locked' && onClick(node)}
      style={{ cursor: status === 'locked' ? 'default' : 'pointer' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: node.orderIndex * 0.04 }}
      whileHover={status !== 'locked' ? { scale: 1.12 } : {}}
    >
      {/* Outer glow ring for available/completed */}
      {status !== 'locked' && (
        <circle
          cx={node.position.x}
          cy={node.position.y}
          r={R + 8}
          fill="none"
          stroke={status === 'completed' ? (node.color || ring) : ring}
          strokeWidth={status === 'completed' ? 2.5 : 2}
          opacity={status === 'available' ? 0.5 : 0.7}
          filter={`url(#glow-${status === 'completed' ? 'strong' : 'soft'})`}
        >
          {status === 'available' && (
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
          {status === 'available' && (
            <animate
              attributeName="r"
              values={`${R + 6};${R + 12};${R + 6}`}
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}

      {/* Certificate special ring */}
      {node.isCertificate && status === 'completed' && (
        <circle
          cx={node.position.x}
          cy={node.position.y}
          r={R + 16}
          fill="none"
          stroke="#ffd700"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.6}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${node.position.x} ${node.position.y}`}
            to={`360 ${node.position.x} ${node.position.y}`}
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Node circle background */}
      <circle
        cx={node.position.x}
        cy={node.position.y}
        r={R}
        fill={status === 'completed' ? baseColor : status === 'available' ? '#1a1040' : '#12102a'}
        stroke={status === 'locked' ? '#2d2d4e' : (node.color || ring)}
        strokeWidth={status === 'completed' ? 3 : 2}
        filter={status === 'completed' ? 'url(#glow-strong)' : undefined}
      />

      {/* Robot image or emoji fallback */}
      {node.image && status !== 'locked' ? (
        <image
          href={BASE + node.image.slice(1)}
          x={node.position.x - (R - 3)}
          y={node.position.y - (R - 3)}
          width={(R - 3) * 2}
          height={(R - 3) * 2}
          clipPath={`url(#clip-${node.id})`}
          preserveAspectRatio="xMidYMid slice"
          opacity={status === 'completed' ? 1 : 0.82}
        />
      ) : (
        <text
          x={node.position.x}
          y={node.position.y + (node.isCertificate ? 1 : 2)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={node.isCertificate ? 24 : 22}
          style={{ userSelect: 'none', filter: status === 'locked' ? 'grayscale(1)' : undefined }}
        >
          {node.emoji}
        </text>
      )}

      {/* Glass highlight on top of image / emoji */}
      {status !== 'locked' && (
        <circle
          cx={node.position.x - R * 0.22}
          cy={node.position.y - R * 0.22}
          r={R * 0.32}
          fill="white"
          opacity={0.08}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Lock icon on locked nodes */}
      {status === 'locked' && (
        <text
          x={node.position.x + R - 8}
          y={node.position.y - R + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          style={{ userSelect: 'none' }}
        >
          🔒
        </text>
      )}

      {/* Check badge on completed */}
      {status === 'completed' && !node.isCertificate && (
        <circle
          cx={node.position.x + R - 7}
          cy={node.position.y - R + 7}
          r={9}
          fill="#10b981"
          stroke="#06041a"
          strokeWidth={1.5}
        />
      )}
      {status === 'completed' && !node.isCertificate && (
        <text
          x={node.position.x + R - 7}
          y={node.position.y - R + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fill="white"
          style={{ userSelect: 'none' }}
        >
          ✓
        </text>
      )}

      {/* XP badge on available */}
      {status === 'available' && (
        <>
          <rect
            x={node.position.x - 16}
            y={node.position.y - R - 18}
            width={32}
            height={14}
            rx={7}
            fill="#1a1040"
            stroke={node.color || ring}
            strokeWidth={1}
          />
          <text
            x={node.position.x}
            y={node.position.y - R - 11}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill={node.color || ring}
            style={{ userSelect: 'none', fontWeight: 700 }}
          >
            +{node.xp}XP
          </text>
        </>
      )}

      {/* Node name */}
      <text
        x={node.position.x}
        y={node.position.y + R + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fill={status === 'locked' ? '#3d3d5e' : '#c4b5fd'}
        style={{ userSelect: 'none', fontWeight: 600 }}
      >
        {node.name}
      </text>

      {/* Rarity sparkles for epic/legendary */}
      {(node.rarity === 'epic' || node.rarity === 'legendary') && status === 'completed' && (
        <>
          {[...Array(4)].map((_, i) => {
            const angle  = (i * 90) * Math.PI / 180
            const sx     = node.position.x + Math.cos(angle) * (R + 22)
            const sy     = node.position.y + Math.sin(angle) * (R + 22)
            return (
              <text key={i} x={sx} y={sy} textAnchor="middle" dominantBaseline="middle"
                fontSize={node.rarity === 'legendary' ? 10 : 8}
                style={{ userSelect: 'none' }}
              >
                ✦
              </text>
            )
          })}
        </>
      )}

      {/* Selected highlight */}
      {isSelected && (
        <circle
          cx={node.position.x}
          cy={node.position.y}
          r={R + 20}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeDasharray="4 4"
          opacity={0.6}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${node.position.x} ${node.position.y}`}
            to={`-360 ${node.position.x} ${node.position.y}`}
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </motion.g>
  )
}

// ── Animated Edge ────────────────────────────────────────────────────
function TreeEdge({ fromStatus, toStatus, fromNode, toNode }) {
  const d      = edgePath(fromNode.position, toNode.position)
  const active = fromStatus === 'completed' && toStatus !== 'locked'
  const done   = fromStatus === 'completed' && toStatus === 'completed'
  const color  = done ? (toNode.color || '#a78bfa') : active ? '#a78bfa' : '#1e1b4b'

  return (
    <g>
      {/* Base path */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={done ? 2.5 : active ? 2 : 1.5}
        strokeLinecap="round"
        opacity={done ? 0.9 : active ? 0.6 : 0.2}
        filter={done ? 'url(#glow-soft)' : undefined}
        strokeDasharray={!done && !active ? '6 6' : undefined}
      />

      {/* Flowing particle on active-but-not-done edges */}
      {active && !done && (
        <circle r={3} fill={toNode.color || '#a78bfa'} opacity={0.9}>
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path={d}
          />
        </circle>
      )}

      {/* Stronger flow on completed edges */}
      {done && (
        <>
          <path
            d={d}
            fill="none"
            stroke="white"
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.15}
            strokeDasharray="4 12"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-16"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </path>
          <circle r={2.5} fill="white" opacity={0.7}>
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={d}
            />
          </circle>
        </>
      )}
    </g>
  )
}

// ── Node Detail Panel ────────────────────────────────────────────────
function NodePanel({ node, status, onComplete, onClose }) {
  const cat  = CATEGORY[node.category] || CATEGORY.mechanics
  const ring = RARITY_RING[node.rarity] || '#a78bfa'

  return (
    <motion.div
      className="tree-node-panel"
      initial={{ opacity: 0, x: 40, scale: 0.92 }}
      animate={{ opacity: 1, x: 0,  scale: 1 }}
      exit={  { opacity: 0, x: 40, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{ '--node-color': node.color || ring }}
    >
      <button className="tree-panel-close" onClick={onClose}>✕</button>

      <div className="tree-panel-header">
        <span className="tree-panel-emoji">{node.emoji}</span>
        <div>
          <h3 className="tree-panel-name">{node.name}</h3>
          <p className="tree-panel-subtitle">{node.subtitle}</p>
        </div>
      </div>

      <div className="tree-panel-badges">
        <span className="tree-badge" style={{ borderColor: cat.color, color: cat.color }}>
          {cat.icon} {cat.label}
        </span>
        <span className="tree-badge tree-badge-rarity" data-rarity={node.rarity}>
          {node.rarity}
        </span>
        <span className="tree-badge" style={{ borderColor: '#fbbf24', color: '#fbbf24' }}>
          +{node.xp} XP
        </span>
      </div>

      <p className="tree-panel-mechanics">⚙️ {node.mechanics}</p>
      <p className="tree-panel-desc">{node.description}</p>

      {node.isFree && (
        <p className="tree-panel-free">✨ Clase gratuita — ¡sin requisitos previos!</p>
      )}
      {node.isCertificate && (
        <p className="tree-panel-cert">🎓 Completar este robot otorga el certificado del nivel.</p>
      )}

      <div className="tree-panel-actions">
        {status === 'available' && (
          <button
            className="tree-complete-btn"
            onClick={() => onComplete(node.id)}
          >
            ✓ Marcar como completado
          </button>
        )}
        {status === 'completed' && (
          <div className="tree-completed-badge">
            <span>🏅 ¡Completado!</span>
          </div>
        )}
        {status === 'locked' && (
          <p className="tree-locked-msg">
            🔒 Completá los robots anteriores para desbloquear este.
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── XP / Level bar ───────────────────────────────────────────────────
function LevelBar({ levelInfo, totalXP, courseProgress }) {
  const { current, next, progress } = levelInfo
  return (
    <div className="tree-level-bar">
      <div className="tree-level-left">
        <span className="tree-level-icon">{current.icon}</span>
        <div>
          <p className="tree-level-name" style={{ color: current.color }}>{current.name}</p>
          <p className="tree-level-xp">{totalXP} XP</p>
        </div>
      </div>

      <div className="tree-level-center">
        <div className="tree-xp-bar-bg">
          <motion.div
            className="tree-xp-bar-fill"
            style={{ background: `linear-gradient(90deg, ${current.color}, ${next?.color || '#fbbf24'})` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        {next && (
          <p className="tree-xp-next">{levelInfo.xpInLevel}/{levelInfo.xpToNext} XP → {next.name}</p>
        )}
      </div>

      <div className="tree-level-right">
        <div className="tree-course-pct">
          <svg viewBox="0 0 36 36" width={48} height={48}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1b4b" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeDasharray={`${courseProgress.pct} ${100 - courseProgress.pct}`}
              strokeDashoffset="25"
              strokeLinecap="round"
            />
          </svg>
          <span className="tree-course-pct-num">{courseProgress.pct}%</span>
        </div>
        <p className="tree-course-label">{courseProgress.completed}/{courseProgress.total}</p>
      </div>
    </div>
  )
}

// ── Background grid ──────────────────────────────────────────────────
function CircuitBackground({ width, height }) {
  const gridSize = 40
  const cols = Math.ceil(width  / gridSize)
  const rows = Math.ceil(height / gridSize)

  return (
    <g opacity={0.06}>
      {/* Horizontal lines */}
      {[...Array(rows + 1)].map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * gridSize} x2={width} y2={i * gridSize}
          stroke="#a78bfa" strokeWidth={0.5} />
      ))}
      {/* Vertical lines */}
      {[...Array(cols + 1)].map((_, i) => (
        <line key={`v${i}`} x1={i * gridSize} y1={0} x2={i * gridSize} y2={height}
          stroke="#a78bfa" strokeWidth={0.5} />
      ))}
      {/* Dots at intersections */}
      {[...Array(rows + 1)].map((_, r) =>
        [...Array(cols + 1)].map((_, c) => (
          <circle key={`d${r}-${c}`} cx={c * gridSize} cy={r * gridSize} r={1.2}
            fill="#a78bfa" />
        ))
      )}
    </g>
  )
}

// ── Main SkillTree View ──────────────────────────────────────────────
export default function SkillTreeView({ student, onClose }) {
  const {
    completedNodes, totalXP, levelInfo, courseProgress,
    nodeStatus, completeNode,
  } = useStudentProgress(student.id)

  const [selectedNode, setSelectedNode] = useState(null)
  const [activeCourse, setActiveCourse] = useState(CURSO)
  const containerRef = useRef(null)

  const courseNodes = useMemo(() =>
    Object.values(ROBOTS).filter(r => r.course === activeCourse),
    [activeCourse]
  )

  const courseEdges = useMemo(() =>
    EDGES.filter(e => {
      const from = ROBOTS[e.from], to = ROBOTS[e.to]
      return from?.course === activeCourse && to?.course === activeCourse
    }),
    [activeCourse]
  )

  const course  = COURSES[activeCourse]
  const canvasH = course.canvasH
  // Offset: positions in data have y going down from top of canvas
  // For upward tree: translate to put root near bottom
  const SVG_H   = canvasH

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }, [])

  const handleComplete = useCallback((nodeId) => {
    completeNode(nodeId)
    setSelectedNode(null)
  }, [completeNode])

  // Close panel on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Scroll to show the highest unlocked node
  useEffect(() => {
    if (!containerRef.current) return
    const available = courseNodes.filter(n => nodeStatus(n.id) === 'available')
    if (available.length) {
      const topY = Math.min(...available.map(n => n.position.y))
      const scrollTo = topY - 200
      containerRef.current.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' })
    }
  }, [courseNodes, nodeStatus])

  const intermediaUnlocked = completedNodes.has('grab-croco')

  return (
    <motion.div
      className="skill-tree-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="tree-header">
        <div className="tree-header-left">
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="tree-student-avatar"
            onError={e => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7C3AED&color=fff&size=80&bold=true`
            }}
          />
          <div>
            <h2 className="tree-student-name">{student.name.split(' ')[0]}</h2>
            <p className="tree-student-level">Árbol de Progreso</p>
          </div>
        </div>

        <div className="tree-course-tabs">
          <button
            className={`tree-tab ${activeCourse === 'inicial' ? 'tree-tab-active' : ''}`}
            onClick={() => setActiveCourse('inicial')}
          >
            101 Inicial
          </button>
          <button
            className={`tree-tab ${activeCourse === 'intermedia' ? 'tree-tab-active' : ''} ${!intermediaUnlocked ? 'tree-tab-locked' : ''}`}
            onClick={() => intermediaUnlocked && setActiveCourse('intermedia')}
          >
            {!intermediaUnlocked && '🔒 '}Intermedia
          </button>
        </div>

        <button className="tree-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* XP / Level bar */}
      <LevelBar levelInfo={levelInfo} totalXP={totalXP} courseProgress={courseProgress} />

      {/* Tree canvas + panel */}
      <div className="tree-body">
        {/* SVG canvas */}
        <div className="tree-canvas-wrap" ref={containerRef}>
          <svg
            width={CANVAS_W}
            height={SVG_H}
            viewBox={`0 0 ${CANVAS_W} ${SVG_H}`}
            className="tree-svg"
          >
            <defs>
              <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Circular clip paths for robot images */}
              {courseNodes.map(node => node.image && (
                <clipPath key={`clip-${node.id}`} id={`clip-${node.id}`}>
                  <circle cx={node.position.x} cy={node.position.y} r={R - 3} />
                </clipPath>
              ))}
            </defs>

            {/* Background grid */}
            <CircuitBackground width={CANVAS_W} height={SVG_H} />

            {/* Edges (drawn below nodes) */}
            {courseEdges.map(edge => {
              const fromNode = ROBOTS[edge.from]
              const toNode   = ROBOTS[edge.to]
              if (!fromNode || !toNode) return null
              return (
                <TreeEdge
                  key={edge.id}
                  fromNode={fromNode}
                  toNode={toNode}
                  fromStatus={nodeStatus(edge.from)}
                  toStatus={nodeStatus(edge.to)}
                />
              )
            })}

            {/* Nodes */}
            {courseNodes.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                status={nodeStatus(node.id)}
                isSelected={selectedNode?.id === node.id}
                onClick={handleNodeClick}
              />
            ))}
          </svg>
        </div>

        {/* Side panel */}
        <div className="tree-panel-col">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <NodePanel
                key={selectedNode.id}
                node={selectedNode}
                status={nodeStatus(selectedNode.id)}
                onComplete={handleComplete}
                onClose={() => setSelectedNode(null)}
              />
            ) : (
              <motion.div
                key="hint"
                className="tree-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="tree-hint-icon">🤖</p>
                <p className="tree-hint-text">Tocá un nodo para ver detalles</p>
                <p className="tree-hint-sub">
                  Los nodos con borde pulsante están listos para completar.
                </p>

                {/* Legend */}
                <div className="tree-legend">
                  <div className="legend-row">
                    <span className="legend-dot completed" />
                    <span>Completado</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-dot available" />
                    <span>Disponible</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-dot locked" />
                    <span>Bloqueado</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
