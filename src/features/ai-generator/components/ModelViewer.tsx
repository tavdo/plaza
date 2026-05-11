import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useTranslation } from '../../../hooks/useTranslation'
import type { Key } from '../../../lib/i18n'

type SceneProps = {
  url: string | null
  wireframe: boolean
  autoRotate: boolean
}

function applyWireframe(root: THREE.Object3D, enabled: boolean) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.material) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((m) => {
      const om = m as THREE.Material & { wireframe?: boolean; needsUpdate?: boolean }
      if ('wireframe' in om) {
        om.wireframe = enabled
        om.needsUpdate = true
      }
    })
  })
}

function GlamModel({ url, wireframe }: { url: string; wireframe: boolean }) {
  const gltf = useGLTF(url)
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  useEffect(() => {
    applyWireframe(model, wireframe)
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
            m.envMapIntensity = 1.05
            m.metalness = Math.min(1, m.metalness + 0.04)
            m.roughness = Math.max(0.12, m.roughness - 0.02)
          }
        })
      }
    })
  }, [model, wireframe])

  return <primitive object={model} scale={[1.2, 1.2, 1.2]} position={[0, -0.35, 0]} />
}

function LuxuryFallback() {
  return (
    <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
      <torusKnotGeometry args={[0.55, 0.14, 260, 48]} />
      <meshStandardMaterial color="#c9a227" metalness={0.92} roughness={0.22} envMapIntensity={1.2} />
    </mesh>
  )
}

class ViewerErrorBoundary extends Component<{ children: ReactNode }, { err: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { err: false }
  }

  static getDerivedStateFromError() {
    return { err: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error
    void info
    /* Nano Banana will replace asset pipeline; keep UX resilient. */
  }

  render() {
    if (this.state.err) {
      return <LuxuryFallback />
    }
    return this.props.children
  }
}

function Scene({ url, wireframe, autoRotate }: SceneProps) {
  return (
    <>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.28} />
      <spotLight position={[6, 10, 6]} angle={0.28} penumbra={0.9} intensity={1.8} castShadow />
      <directionalLight position={[-4, 6, -2]} intensity={0.45} color="#f5d76e" />
      {url ? (
        <ViewerErrorBoundary>
          <Suspense fallback={<LuxuryFallback />}>
            <GlamModel url={url} wireframe={wireframe} />
          </Suspense>
        </ViewerErrorBoundary>
      ) : (
        <LuxuryFallback />
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.2} roughness={0.85} />
      </mesh>
      <Environment preset="city" />
      <OrbitControls
        enablePan
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        maxPolarAngle={Math.PI / 2 - 0.08}
        minDistance={1.2}
        maxDistance={8}
      />
    </>
  )
}

function CanvasResize() {
  const { gl } = useThree()
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }, [gl])
  return null
}

type Props = {
  url: string | null
}

export function ModelViewer({ url }: Props) {
  const { t } = useTranslation()
  const shellRef = useRef<HTMLDivElement>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [wireframe, setWireframe] = useState(false)

  const goFullscreen = useCallback(() => {
    const el = shellRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void el.requestFullscreen?.()
    }
  }, [])

  const uiBtn =
    'rounded-lg border border-white/10 bg-void-950/90 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-300 shadow-lg backdrop-blur-md transition hover:border-gold-500/40 hover:text-gold-300'

  const loadingLabelKey: Key = 'ai.viewer.loading'

  return (
    <div
      ref={shellRef}
      className="relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-void-950 sm:min-h-[360px] lg:min-h-[420px]"
    >
      <Suspense
        fallback={
          <div className="flex min-h-[280px] items-center justify-center text-xs text-zinc-500 sm:min-h-[360px] lg:min-h-[420px]">
            {t(loadingLabelKey)}
          </div>
        }
      >
        <Canvas shadows camera={{ position: [2.2, 1.55, 3.2], fov: 42 }} className="h-full min-h-[280px] w-full sm:min-h-[360px] lg:min-h-[420px]">
          <CanvasResize />
          <Scene url={url} wireframe={wireframe} autoRotate={autoRotate} />
        </Canvas>
      </Suspense>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap justify-end gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button type="button" className={uiBtn} onClick={() => setWireframe((w) => !w)}>
            {t(wireframe ? 'ai.viewer.solid' : 'ai.viewer.wireframe')}
          </button>
          <button type="button" className={uiBtn} onClick={() => setAutoRotate((a) => !a)}>
            {t(autoRotate ? 'ai.viewer.autoOn' : 'ai.viewer.autoOff')}
          </button>
          {/* TODO: Hook preview transport to Nano Banana session (signed asset URLs, progress). */}
          <button type="button" className={uiBtn} onClick={goFullscreen}>
            {t('ai.viewer.fullscreen')}
          </button>
        </div>
      </div>
    </div>
  )
}

useGLTF.preload('/models/gold_ring.glb')
useGLTF.preload('/models/silver_helmet.glb')
useGLTF.preload('/models/platinum_vase.glb')
