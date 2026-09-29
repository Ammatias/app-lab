import { useEffect, useRef, useState } from 'react'
import {
  Download,
  Expand,
  FileText,
  Loader2,
  MoveHorizontal,
  RefreshCw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { fetchFileStoragePreview } from '../../../entities/file-storage/api'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { formatFileSize, getFileExtension } from '../lib/fileStorage'
import {
  getInitialPreviewProgress,
  getPageRenderProgress,
  getPreviewZoomForShortcut,
  nextPreviewRotation,
  PREVIEW_ZOOM_MAX,
  PREVIEW_ZOOM_MIN,
  stepPreviewZoom
} from '../lib/fileStoragePreview'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const EMPTY_PROGRESS = { percent: 0, label: '', loadedBytes: 0, totalBytes: 0 }

export function FileStoragePreviewModal({ open, file, onClose, onDownload }) {
  const previewRef = useRef(null)
  const documentRef = useRef(null)
  const renderedPagesRef = useRef(new Set())
  const zoomAnchorRef = useRef(null)
  const [previewBlob, setPreviewBlob] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(EMPTY_PROGRESS)
  const [numPages, setNumPages] = useState(0)
  const [pageWidth, setPageWidth] = useState(900)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const fullscreenSupported = typeof document !== 'undefined' && Boolean(document.fullscreenEnabled)

  useEffect(() => {
    if (!open || !file) return undefined

    const controller = new AbortController()
    renderedPagesRef.current = new Set()
    setPreviewBlob(null)
    setNumPages(0)
    setZoom(1)
    setRotation(0)
    setError('')
    setLoading(true)
    setProgress({ ...getInitialPreviewProgress(file.file_name), loadedBytes: 0, totalBytes: 0 })

    fetchFileStoragePreview(file, {
      signal: controller.signal,
      onProgress: setProgress
    })
      .then((blob) => {
        setPreviewBlob(blob)
        setProgress((current) => ({ ...current, percent: 95, label: 'Открываем документ' }))
      })
      .catch((previewError) => {
        if (previewError.name !== 'AbortError') {
          setError(previewError.message || 'Не удалось сформировать предпросмотр')
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [file, open, retryKey])

  useEffect(() => {
    if (!documentRef.current || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => {
      const availableWidth = Math.max(240, entry.contentRect.width - 32)
      setPageWidth(Math.min(1120, availableWidth))
    })
    observer.observe(documentRef.current)
    return () => observer.disconnect()
  }, [previewBlob, fullscreen])

  useEffect(() => {
    const container = documentRef.current
    if (!container || !previewBlob) return undefined

    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const rect = container.getBoundingClientRect()
      zoomAnchorRef.current = {
        xRatio: container.scrollWidth > 0
          ? (container.scrollLeft + event.clientX - rect.left) / container.scrollWidth
          : 0.5,
        yRatio: container.scrollHeight > 0
          ? (container.scrollTop + event.clientY - rect.top) / container.scrollHeight
          : 0.5,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
      }
      setZoom((current) => stepPreviewZoom(current, event.deltaY < 0 ? 1 : -1, 0.1))
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [previewBlob])

  useEffect(() => {
    const container = documentRef.current
    const anchor = zoomAnchorRef.current
    if (!container || !anchor) return undefined

    const animationFrame = requestAnimationFrame(() => {
      container.scrollLeft = anchor.xRatio * container.scrollWidth - anchor.offsetX
      container.scrollTop = anchor.yRatio * container.scrollHeight - anchor.offsetY
      zoomAnchorRef.current = null
    })
    return () => cancelAnimationFrame(animationFrame)
  }, [zoom])

  useEffect(() => {
    if (!open || !previewBlob) return undefined

    const handleKeyDown = (event) => {
      const nextZoom = getPreviewZoomForShortcut(event, zoom)
      if (nextZoom === null) return
      event.preventDefault()
      zoomAnchorRef.current = null
      setZoom(nextZoom)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, previewBlob, zoom])

  useEffect(() => {
    const handleFullscreenChange = () => setFullscreen(document.fullscreenElement === previewRef.current)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleFullscreen = async () => {
    if (!previewRef.current || !fullscreenSupported) return
    if (document.fullscreenElement === previewRef.current) await document.exitFullscreen()
    else await previewRef.current.requestFullscreen()
  }

  const handleClose = async () => {
    if (document.fullscreenElement === previewRef.current) await document.exitFullscreen()
    onClose()
  }

  const handlePdfLoaded = ({ numPages: loadedPages }) => {
    renderedPagesRef.current = new Set()
    setNumPages(loadedPages)
    setProgress((current) => ({ ...current, percent: 96, label: 'Отрисовываем страницы' }))
  }

  const handlePageRendered = (pageNumber) => {
    renderedPagesRef.current.add(pageNumber)
    const renderedPages = renderedPagesRef.current.size
    const percent = getPageRenderProgress(renderedPages, numPages)
    setProgress((current) => ({
      ...current,
      percent,
      label: percent === 100 ? 'Готово' : 'Отрисовываем страницы'
    }))
    if (percent === 100) setLoading(false)
  }

  const handlePdfError = (pdfError) => {
    setError(pdfError?.message || 'PDF не удалось открыть во встроенном просмотрщике')
    setLoading(false)
  }

  const changeZoom = (direction) => {
    zoomAnchorRef.current = null
    setZoom((current) => stepPreviewZoom(current, direction))
  }

  const fitToWidth = () => {
    zoomAnchorRef.current = null
    setZoom(1)
  }

  const fileMeta = file
    ? `${getFileExtension(file.file_name).toUpperCase()} · ${formatFileSize(file.byte_size)}`
    : ''
  const byteMeta = progress.totalBytes > 0 && progress.label === 'Загружаем PDF'
    ? `${formatFileSize(progress.loadedBytes)} / ${formatFileSize(progress.totalBytes)}`
    : ''
  const controlsDisabled = !previewBlob || Boolean(error)
  const zoomPercent = Math.round(zoom * 100)

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      overlayClassName="modal-overlay modal-overlay-primary file-storage-preview-overlay"
      panelClassName="glass-panel modal-panel file-storage-preview-modal"
    >
      <div
        className="file-storage-preview-shell"
        ref={previewRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-storage-preview-title"
      >
        <header className="file-storage-preview-header">
          <span className="file-storage-preview-icon"><FileText size={20} /></span>
          <div className="file-storage-preview-title">
            <h2 id="file-storage-preview-title">{file?.file_name || 'Предпросмотр документа'}</h2>
            <span>{fileMeta}</span>
          </div>
          <div className="file-storage-preview-actions">
            <div className="file-storage-preview-controls" role="group" aria-label="Управление документом">
              <button
                type="button"
                className="btn"
                onClick={() => changeZoom(-1)}
                disabled={controlsDisabled || zoom <= PREVIEW_ZOOM_MIN}
                aria-label="Уменьшить масштаб"
                title="Уменьшить (Ctrl −)"
              >
                <ZoomOut size={16} />
              </button>
              <output aria-label={`Текущий масштаб ${zoomPercent}%`}>{zoomPercent}%</output>
              <button
                type="button"
                className="btn"
                onClick={() => changeZoom(1)}
                disabled={controlsDisabled || zoom >= PREVIEW_ZOOM_MAX}
                aria-label="Увеличить масштаб"
                title="Увеличить (Ctrl +)"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className={`btn file-storage-preview-fit${zoom === 1 ? ' is-active' : ''}`}
                onClick={fitToWidth}
                disabled={controlsDisabled}
                aria-label="Вписать страницу по ширине"
                aria-pressed={zoom === 1}
                title="По ширине страницы (Ctrl 0)"
              >
                <MoveHorizontal size={16} /> <span>По ширине</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setRotation((current) => nextPreviewRotation(current))}
                disabled={controlsDisabled}
                aria-label="Повернуть по часовой стрелке"
                title="Повернуть по часовой стрелке"
              >
                <RotateCw size={16} />
              </button>
            </div>
            {fullscreenSupported ? (
              <button type="button" className="btn file-storage-preview-fullscreen" onClick={handleFullscreen} aria-label="Открыть на весь экран">
                <Expand size={16} /> <span>{fullscreen ? 'Выйти из полного экрана' : 'На весь экран'}</span>
              </button>
            ) : null}
            <button type="button" className="btn" onClick={() => onDownload(file)} aria-label="Скачать оригинал">
              <Download size={16} /> <span>Скачать</span>
            </button>
            <button type="button" className="btn file-storage-preview-close" onClick={handleClose} aria-label="Закрыть предпросмотр">
              <X size={17} />
            </button>
          </div>
        </header>

        <div className="file-storage-preview-body">
          {loading && !previewBlob ? (
            <div className="file-storage-preview-state" role="status">
              <Loader2 className="spinner" size={34} />
              <strong>{progress.label}</strong>
              <div
                className="file-storage-preview-progress"
                role="progressbar"
                aria-label="Готовность предпросмотра"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progress.percent}
                aria-valuetext={`${progress.label}, ${progress.percent}%`}
              >
                <span style={{ width: `${progress.percent}%` }} />
              </div>
              <span className="file-storage-preview-progress-copy">
                <b>{progress.percent}%</b>{byteMeta ? ` · ${byteMeta}` : ''}
              </span>
            </div>
          ) : null}
          {error ? (
            <div className="file-storage-preview-state file-storage-preview-error" role="alert">
              <FileText size={42} />
              <strong>Не удалось открыть предпросмотр</strong>
              <span>{error}</span>
              <div className="file-storage-preview-error-actions">
                <button type="button" className="btn" onClick={() => setRetryKey((value) => value + 1)}>
                  <RefreshCw size={16} /> Повторить
                </button>
                <button type="button" className="btn btn-primary" onClick={() => onDownload(file)}>
                  <Download size={16} /> Скачать оригинал
                </button>
              </div>
            </div>
          ) : null}
          {previewBlob && !error ? (
            <div className="file-storage-preview-document" ref={documentRef}>
              {loading ? (
                <div className="file-storage-preview-render-progress" role="status" aria-live="polite">
                  <span>{progress.label}</span>
                  <b>{progress.percent}%</b>
                </div>
              ) : null}
              <Document
                file={previewBlob}
                loading={null}
                noData={null}
                error={null}
                onLoadSuccess={handlePdfLoaded}
                onLoadError={handlePdfError}
              >
                {Array.from({ length: numPages }, (_, index) => {
                  const pageNumber = index + 1
                  return (
                    <Page
                      key={pageNumber}
                      pageNumber={pageNumber}
                      width={pageWidth}
                      scale={zoom}
                      rotate={rotation}
                      renderTextLayer
                      renderAnnotationLayer
                      onRenderSuccess={() => handlePageRendered(pageNumber)}
                    />
                  )
                })}
              </Document>
            </div>
          ) : null}
        </div>
      </div>
    </ModalShell>
  )
}
