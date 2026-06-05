'use client'

import { useState } from 'react'
import { COLOR_OPTIONS } from '@/lib/color-utils'

interface Stats {
  processed: number
  updated: number
  remaining: number
  errors: string[]
  done: boolean
}

export default function ExtractColorsPage() {
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [total, setTotal] = useState({ processed: 0, updated: 0, errors: 0 })
  const [done, setDone] = useState(false)

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-100), msg])

  const run = async () => {
    setRunning(true)
    setDone(false)
    setLog([])
    setTotal({ processed: 0, updated: 0, errors: 0 })

    let offset = 0
    let batchDone = false

    while (!batchDone) {
      try {
        addLog(`⏳ Processing batch at offset ${offset}…`)
        const res = await fetch(`/api/admin/extract-colors?offset=${offset}`)
        const data: Stats = await res.json()

        const errs = data.errors ?? []
        setTotal((prev) => ({
          processed: prev.processed + data.processed,
          updated: prev.updated + data.updated,
          errors: prev.errors + errs.length,
        }))

        if (errs.length > 0) {
          errs.forEach((e) => addLog(`  ⚠️ ${e}`))
        }

        addLog(
          `  ✅ Batch done — updated ${data.updated}/${data.processed}, ~${data.remaining} remaining`,
        )

        if (data.done || data.processed === 0) {
          batchDone = true
          setDone(true)
          addLog('🎉 All wallpapers processed!')
        } else {
          offset += data.processed
          // Small delay to avoid hammering
          await new Promise((r) => setTimeout(r, 500))
        }
      } catch (e: any) {
        addLog(`❌ Fetch error: ${e?.message ?? e}`)
        batchDone = true
      }
    }

    setRunning(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-2">Extract Dominant Colors</h1>
      <p className="text-gray-400 text-sm mb-8">
        Processes wallpapers in batches of 10. Fetches each thumbnail, extracts the dominant color,
        and stores it in the <code className="text-green-400">dominant_color</code> column.
        Safe to run multiple times — skips wallpapers that already have a color.
      </p>

      {/* Color reference */}
      <div className="bg-gray-800 rounded-xl p-4 mb-8">
        <p className="text-gray-400 text-xs mb-3">Color buckets that will be assigned:</p>
        <div className="flex flex-wrap gap-3">
          {COLOR_OPTIONS.map((c) => (
            <div key={c.value} className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full ${c.bg} ring-1 ring-white/20`} />
              <span className="text-gray-300 text-xs">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={run}
        disabled={running}
        className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors mb-6"
      >
        {running ? '⏳ Running…' : done ? '✅ Run Again' : '▶ Start Extraction'}
      </button>

      {/* Progress */}
      {(total.processed > 0 || running) && (
        <div className="flex gap-6 mb-6 text-sm">
          <div className="bg-gray-800 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-white">{total.processed}</div>
            <div className="text-gray-500 text-xs">Processed</div>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-green-400">{total.updated}</div>
            <div className="text-gray-500 text-xs">Updated</div>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-3 text-center">
            <div className={`text-2xl font-bold ${total.errors > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {total.errors}
            </div>
            <div className="text-gray-500 text-xs">Errors</div>
          </div>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 max-h-80 overflow-y-auto space-y-0.5">
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </div>
  )
}
