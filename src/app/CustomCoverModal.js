// CustomCoverModal.js
'use client';

import { useState, useRef, useEffect } from 'react';

export default function CustomCoverModal({ videoFile, cover, setCover, closeModal }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [frameTime, setFrameTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // States texte, police, couleur, background, position
  const [text, setText] = useState('');
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState('#000000');
  const [bgEnabled, setBgEnabled] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textPos, setTextPos] = useState({ x: 50, y: 50 });

  // 🔹 Synchronisation des states avec la cover existante
  useEffect(() => {
    if (cover?.meta) {
      setText(cover.meta.text || '');
      setFont(cover.meta.font || 'Arial');
      setFontSize(cover.meta.fontSize || 36);
      setTextColor(cover.meta.textColor || '#000000');
      setBgEnabled(cover.meta.bgEnabled || false);
      setBgColor(cover.meta.bgColor || '#ffffff');
      setTextPos(cover.meta.textPos || { x: 50, y: 50 });
    } else {
      // valeurs par défaut si aucune cover existante
      setText('');
      setFont('Arial');
      setFontSize(36);
      setTextColor('#000000');
      setBgEnabled(false);
      setBgColor('#ffffff');
      setTextPos({ x: 50, y: 50 });
    }
  }, [cover]);

  // Charger la durée de la vidéo
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setVideoDuration(v.duration || 0);
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [videoFile]);


  // ajuster taille du canvas pour remplir la hauteur de la modal (avec padding)
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const cont = containerRef.current;
      if (!canvas || !cont) return;
      // padding total vertical = 100 (50px top + 50px bottom)
      const height = Math.max(200, cont.clientHeight - 100);
      // choose an aspect ratio similar to vertical short (9:16)
      const width = Math.round(height * 9 / 16);
      canvas.width = width;
      canvas.height = height;
      // redraw current frame
      drawFrame();
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]);

  // dessine la frame + barres + texte
  const drawFrame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext && canvas.getContext('2d');
    const video = videoRef.current;
    if (!ctx || !video) return;

    // dessiner fond blanc avant
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // dessiner la frame (on conserve ratio et on crop center)
    // calc scale pour remplir canvas (cover)
    const vw = video.videoWidth || 1;
    const vh = video.videoHeight || 1;
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / vw, ch / vh);
    const sw = vw * scale;
    const sh = vh * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    try {
      ctx.drawImage(video, sx, sy, sw, sh);
    } catch (e) {
      // drawImage peut échouer si video n'est pas seeked encore
    }

    //                             Barres opaques top/bottom : 10% hauteur
    // const barH = canvas.height * 0.10;
    // ctx.fillStyle = 'rgba(0,0,0,0.5)';
    // ctx.fillRect(0, 0, canvas.width, barH);
    // ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

    // Texte background si activé
    ctx.font = `${fontSize}px ${font}`;
    const metrics = ctx.measureText(text || '');
    const textW = metrics.width;
    const padding = 8;

    // position texte: on utilise textPos.x/y comme pixels relatifs au canvas
    let x = textPos.x;
    let y = textPos.y;

    // bornes : empêcher de dépasser
    x = Math.min(Math.max(0, x), canvas.width - textW - 1);
    y = Math.min(Math.max(fontSize, y), canvas.height - 5);

    if (bgEnabled && text) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(x - padding, y - fontSize - padding/2, textW + padding*2, fontSize + padding);
    }

    // texte (noir ou couleur choisie)
    if (text) {
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px ${font}`;
      ctx.fillText(text, x, y);
    }
  };

  // redraw après seek (video.currentTime changed)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onSeek = () => drawFrame();
    video.addEventListener('seeked', onSeek);
    // for safety draw once
    drawFrame();
    return () => video.removeEventListener('seeked', onSeek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameTime, font, fontSize, text, textColor, bgEnabled, bgColor, textPos]);

  // slider change -> change time
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // clamp
    const t = Math.min(Math.max(0, frameTime), videoDuration || 0);
    try { v.currentTime = t; } catch (e) { /* ignore */ }
    // draw will happen on 'seeked' event
  }, [frameTime, videoDuration]);

  // Drag & drop for text on canvas (desktop & mobile)
  const dragging = useRef(false);
  const handlePointerDown = (e) => {
    dragging.current = true;
    e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
  };
  const handlePointerUp = (e) => {
    dragging.current = false;
    e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId);
  };
  const handlePointerMove = (e) => {
    if (!dragging.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // bornes automatiques dans drawFrame
    setTextPos({ x, y });
  };

  // appliquer : générer image finale (base64) et appeler setCover
  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png'); // base64
    setCover({
      imgData,
      text,
      font,
      fontSize,
      textColor,
      bgEnabled,
      bgColor,
      textPos
    });
    closeModal();
  };

  const handleCancel = () => {
    // fermer sans appliquer => on ne modifie pas setCover
    closeModal();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}>
      <div
        ref={containerRef}
        style={{
          width: '75vw',
          height: '50vh',
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          gap: 20,
          boxSizing: 'border-box'
        }}
      >
        {/* Gauche: lecteur vidéo + slider */}
        <div style={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <video ref={videoRef} src={videoFile?.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <input
            type="range"
            min={0}
            max={videoDuration || 0}
            step={0.1}
            value={frameTime}
            onChange={e => setFrameTime(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Centre: preview canvas (remplit hauteur avec padding) */}
        <div style={{ flex: '0 0 40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <canvas
            ref={canvasRef}
            style={{ cursor: 'move', maxHeight: '100%', borderRadius: 6 }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
          />
        </div>

        {/* Droite: options texte */}
        <div style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', gap: 10}}>
          <label style={{ fontWeight: 600}}>Texte</label>
          <input value={text} onChange={e => setText(e.target.value)} style={{ padding: 8 , border: '1px solid blue'}} />

          <label style={{ fontWeight: 600 }}>Police</label>
          <select value={font} onChange={e => setFont(e.target.value)} style={{ padding: 8 }}>
            <option value="Helvetica">Helvetica</option>
            <option value="Impact">Impact</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </select>

          <label style={{ fontWeight: 600 }}>Taille</label>
          <input type="range" min={12} max={120} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} />

          <label style={{ fontWeight: 600 }}>Couleur du texte</label>
          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={bgEnabled} onChange={e => setBgEnabled(e.target.checked)} />
            <label>Fond texte</label>
          </div>
          {bgEnabled && (
            <>
              <label>Couleur du fond</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
            </>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' , gap : '20px' }}>
            <button onClick={handleCancel} style={{
              border: '1px solid red', color: 'red', backgroundColor: 'white', padding: '10px 20px', borderRadius: 8
            }}>Annuler</button>
            <button onClick={handleApply} style={{
              border: 'none', color: 'white', backgroundColor: 'blue', padding: '10px 20px', borderRadius: 8
            }}>Appliquer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
