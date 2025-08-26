// EditScheduledPostModal.js
'use client';

import { useState } from 'react';
import CustomCoverModal from './CustomCoverModal';

export default function EditScheduledPostModal({ post, closeModal, updatePost }) {
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  // States du formulaire
  const [cover, setCover] = useState(post.cover);
  const [description, setDescription] = useState(post.description);
  const [dateTime, setDateTime] = useState(post.schedule);
  const [platforms, setPlatforms] = useState({
    Instagram: post.platforms.includes('Instagram'),
    TikTok: post.platforms.includes('TikTok'),
    YouTube: post.platforms.includes('YouTube'),
  });

  // Ouvrir/fermer custom cover
  const openCoverModal = () => setCoverModalOpen(true);
  const closeCoverModal = () => setCoverModalOpen(false);

  // Appliquer les modifications
  const handleApply = () => {
    // créer un objet avec toutes les infos modifiées
    const updatedPost = {
      ...post,
      cover,
      description,
      schedule: dateTime,
      platforms: Object.keys(platforms).filter(p => platforms[p])
    };

    // Supprimer l'ancien post et ajouter le nouveau
    updatePost(post.id, updatedPost); // <-- ici on passe l'id du post à updatePost

    closeModal();
  };

  const handleCancel = () => closeModal();

  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setPlatforms(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}>
      <div style={{
        width: '60vw',
        height: '60vh',
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        gap: 20,
        boxSizing: 'border-box'
      }}>
        {/* Formulaire + prévisualisation côte à côte */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Description */}
          <label>Description :</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />

          {/* Date et heure */}
          <label>Date & Heure :</label>
          <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} />

          {/* Plateformes */}
          <label>Plateformes :</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Instagram','TikTok','YouTube'].map(p => (
              <label key={p}>
                <input type="checkbox" name={p} checked={platforms[p]} onChange={handlePlatformChange} /> {p}
              </label>
            ))}
          </div>

          {/* Bouton modifier cover */}
          <button type="button" onClick={openCoverModal} style={{
            width: '150px', height: '35px', borderRadius: '10px',
            border: '1px solid #007bff', backgroundColor: '#fff', color: '#007bff'
          }}>Modifier la cover</button>

          {/* Boutons appliquer/annuler */}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
            <button onClick={handleCancel} style={{
              border: '1px solid red', color: 'red', backgroundColor: 'white', padding: '10px 20px', borderRadius: 8
            }}>Annuler</button>
            <button onClick={handleApply} style={{
              border: 'none', color: 'white', backgroundColor: 'blue', padding: '10px 20px', borderRadius: 8
            }}>Appliquer</button>
          </div>
        </div>

        {/* Prévisualisation */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video src={post.video.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
          {cover && <img src={cover.url} alt="Cover" style={{ position: 'absolute', width: '160px', height: 'auto', top: 10, left: 10 }} />}
        </div>
      </div>

      {/* Pop up custom cover */}
      {coverModalOpen && (
        <CustomCoverModal
          videoFile={post.video}
          cover={cover}
          setCover={setCover}
          closeModal={closeCoverModal}
        />
      )}
    </div>
  );
}
