'use client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import CustomCoverModal from './CustomCoverModal';
import EditScheduledPostModal from './EditScheduledPostModal';

export default function UploadForm() {
  const [videoFile, setVideoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const coverInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState({
    Instagram: 0,
    TikTok: 0,
    YouTube: 0,
    Whop: 0
  });
  const [scheduleDate, setScheduleDate] = useState('');
  const [mode, setMode] = useState('immediate');
  const [platforms, setPlatforms] = useState({
    Instagram: true,
    TikTok: true,
    YouTube: false
  });
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [selectedPostVideo, setSelectedPostVideo] = useState(null);

  // ouverture modale de custom cover
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const [editingPost, setEditingPost] = useState(null);

  // ouvrir la modale (vérifie qu'une vidéo est sélectionnée)
  const openCustomModal = () => {
    if (!videoFile) {
      setMessage("Veuillez sélectionner une vidéo avant de personnaliser la cover.");
      setIsError(true);
      return;
    }
    setIsCustomModalOpen(true);
  };

  const closeCustomModal = () => setIsCustomModalOpen(false);

  // recevoir la cover personnalisée depuis la modale
  const setCustomCover = (coverData) => {
    // coverData.imgData est un base64 PNG
    // on garde la même structure que coverFile utilisé ailleurs
    setCoverFile({
      file: null,
      url: coverData.imgData,
      meta: {
        text: coverData.text,
        font: coverData.font,
        fontSize: coverData.fontSize,
        textColor: coverData.textColor,
        bgEnabled: coverData.bgEnabled,
        bgColor: coverData.bgColor,
        textPos: coverData.textPos
      }
    });
  };
  const fetchScheduledPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/scheduled`);
      setScheduledPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
    const interval = setInterval(fetchScheduledPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoFile({ file, url: URL.createObjectURL(file) });
    setProgress({ Instagram: 0, TikTok: 0, YouTube: 0, Whop: 0 });
    setMessage('');
    setIsError(false);

    // Créer la cover par défaut (première frame)
    const tempVideo = document.createElement('video');
    tempVideo.src = URL.createObjectURL(file);
    tempVideo.crossOrigin = "anonymous";

    tempVideo.addEventListener('loadeddata', () => {
      tempVideo.currentTime = 0;
    });

    tempVideo.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = tempVideo.videoWidth;
      canvas.height = tempVideo.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/png');

      // Initialiser coverFile avec cette image
      setCoverFile({
        file: null,
        url: imgData,
        meta: {
          text: '',
          font: 'Arial',
          fontSize: 36,
          textColor: '#000000',
          bgEnabled: false,
          bgColor: '#ffffff',
          textPos: { x: 50, y: 50 }
        }
      });
    });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile({ file, url: URL.createObjectURL(file) });
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    if (coverInputRef.current) coverInputRef.current.value = null;
  };

  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setPlatforms(prev => ({ ...prev, [name]: checked }));
  };

  const simulateProgress = async (platform) => {
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 300));
      setProgress(prev => ({ ...prev, [platform]: i }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setMessage('Veuillez sélectionner une vidéo.');
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile.file);
    if (coverFile) formData.append('cover', coverFile.file);
    formData.append('description', e.target.description.value);
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p] && p !== 'Whop');
    formData.append('platforms', selectedPlatforms.join(','));

    if (mode === 'schedule') {
      if (!scheduleDate) {
        setMessage('Veuillez choisir une date et heure pour la programmation.');
        setIsError(true);
        return;
      }
      formData.append('schedule', scheduleDate);
      try {
        await axios.post(`${BACKEND_URL}/schedule`, formData);
        // Ajout du post dans le state local avec la cover
        const newPost = {
          video: videoFile,
          cover: coverFile,        // ← la cover choisie ou créée
          description: e.target.description.value,
          platforms: selectedPlatforms,
          schedule: scheduleDate
        };
        setScheduledPosts(prev => [...prev, newPost]);
        setMessage(`Vidéo programmée pour le ${scheduleDate} !`);
        setIsError(false);
        fetchScheduledPosts();
      } catch (err) {
        setMessage("Erreur lors de la programmation.");
        setIsError(true);
      }
    } else {
      try {
        await axios.post(`${BACKEND_URL}/upload`, formData);
        setMessage('Vidéo reçue, simulation de publication en cours...');
        setIsError(false);

        // 🔹 Affichage des barres de progression
        for (const p of selectedPlatforms) {
          await simulateProgress(p);
        }
        await simulateProgress('Whop');

        setMessage(`Vidéo publiée sur ${selectedPlatforms.join('/')} et soumise sur Whop (simulé) !`);
      } catch (err) {
        setMessage("Erreur lors de l'upload.");
        setIsError(true);
      }
    }
  };

  const handleDeleteScheduled = async (index) => {
    try {
      await axios.delete(`${BACKEND_URL}/scheduled/${index}`);
      fetchScheduledPosts();
    } catch (err) {
      console.error(err);
    }
  };

  //console.log(scheduledPosts);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      gap: '20px',
      backgroundColor: '#fff',
      fontFamily: 'Roboto, sans-serif',
      color: '#000'
    }}>

      {/* Formulaire + prévisualisation côte à côte */}
      <div style={{ display: 'flex', gap: '40px', transform: 'translateY(-150px)', alignItems: 'center' }}>
        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{
          width: '600px',
          padding: '10px',
          border: '1px solid #555',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          
          backgroundColor: '#fff'
        }}>
          <label>Mode :</label>
          <select value={mode} onChange={e => setMode(e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="immediate">Publier maintenant</option>
            <option value="schedule">Programmer</option>
          </select>

          {mode === 'schedule' && (
            <>
              <label>Date & Heure :</label>
              <input style={{ cursor: 'pointer' }} type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value) } />
            </>
          )}

          <label>Plateformes :</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Instagram','TikTok','YouTube'].map(p => (
              <label key={p}>
                <input
                  type="checkbox"
                  name={p}
                  checked={platforms[p]}
                  onChange={handlePlatformChange}
                  style={{ cursor: 'pointer' }}
                /> {p}
              </label>
            ))}
          </div>

          <label>Vidéo :</label>
          <input type="file" accept="video/mp4" onChange={handleVideoChange} style={{ cursor: 'pointer' }}/>

          <label>Cover (optionnel) :</label>
          <input type="file" accept="image/*" onChange={handleCoverChange} ref={coverInputRef} style={{ cursor: 'pointer' }} />

          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <button
              type="button"
              onClick={openCustomModal}
              style={{
                width: '150px',
                height: '35px',
                borderRadius: '10px',
                border: '1px solid #007bff',
                cursor: 'pointer',
                backgroundColor: '#fff',
                color: '#007bff'
              }}
            >
              {coverFile ? 'Modifier' : 'Créer'}
            </button>
            {coverFile && (
              <button
                type="button"
                onClick={removeCover}
                style={{
                  width: '150px',
                  height: '35px',
                  borderRadius: '10px',
                  border: '1px solid #555',
                  cursor: 'pointer',
                  backgroundColor: '#fff'
                }}
              >
                Supprimer la cover
              </button>
            )}
          </div>

          <label>Description :</label>
          <textarea name="description" rows="3" style={{ borderRadius: '10px', padding: '5px', color: '#000', border: '1px solid blue'}} />

          <button type="submit" style={{
            backgroundColor: '#007bff',
            color: '#fff',
            width: '150px',
            height: '50px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            {mode === 'schedule' ? 'Programmer' : 'Publier'}
          </button>
        </form>

        {/* Prévisualisation vidéo + cover */}
        <div style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          alignItems: 'flex-start'
        }}>
          {videoFile && (
            <div>
              <h3>Vidéo sélectionnée</h3>
              <video src={videoFile.url} controls width="200" />
              <p>{videoFile.file.name}</p>
            </div>
          )}
          {coverFile && (
            <div>
              <h3>Cover sélectionnée</h3>
              <img src={coverFile.url} alt="Cover" width="160" />
              {coverFile.file ? (
                <p>{coverFile.file.name}</p>
              ) : (
                <p>Cover personnalisée</p>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Message d'erreur ou de succès */}
      {/* 
        {message && (
          <div style={{
            color: isError ? 'red' : 'green',
            fontWeight: 'bold',
            marginTop: '10px',
          }}>
            {message}
          </div>
        )}
       */}


      {/* Barres de progression (mode immediate uniquement) */}
      {mode === 'immediate' && (
        <div style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%) translateY(-120px)', width: '600px' }}>
          {Object.keys(progress).map((key) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <strong>{key} :</strong>
              <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#ccc',
                borderRadius: '10px',
                marginTop: '5px'
              }}>
                <div style={{
                  width: `${progress[key]}%`,
                  height: '100%',
                  backgroundColor: '#007bff',
                  borderRadius: '10px',
                  transition: 'width 0.3s'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPostVideo && (
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          backgroundColor: '#fff',
          padding: '10px',
          borderRadius: '10px',
          border: '1px solid #555',
          minWidth: '220px'
        }}>
          <button
            onClick={() => setSelectedPostVideo(null)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#000'
            }}
          >
            ✕
          </button>
          <h3>Prévisualisation du post programmé</h3>
          <video src={selectedPostVideo} controls width="200" />
        </div>
      )}

      {/* Liste des posts programmés */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(0)',
        width: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: '50vh',
        overflowY: 'auto',
        padding: '10px',
        border: '1px solid #555',
        borderRadius: '10px',
        backgroundColor: '#f9f9f9'
      }}>

        <h3>
          Posts programmés <span style={{ fontWeight: 'normal', color: '#555' }}>
            ({scheduledPosts.length})
          </span>
        </h3>
        {scheduledPosts.slice().sort((a,b) => new Date(b.schedule) - new Date(a.schedule)).map((post, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #ccc',
            padding: '5px',
            borderRadius: '5px'
          }}>
            <span style={{ flex: 2, cursor: 'pointer' }} onClick={() => setSelectedPostVideo(post.video.url)}>
              {post.video.filename}
            </span>
            <span style={{ flex: 2 }}>{new Date(post.schedule).toLocaleString()}</span>
            <span style={{ flex: 2 }}>{post.platforms.join(', ')}</span>
             {/* bouton modif post, fonctionne pas, faudra mettre setEditingPost(post) pour activer*/}
            <button onClick={() => alert("Fonctionnalité pas encore dispo")}>Modifier</button>
            <button onClick={() => handleDeleteScheduled(idx)}>Supprimer</button>
          </div>
        ))}
      </div>
      {/* Modale de custom cover */}
      {isCustomModalOpen && (
        <CustomCoverModal
          videoFile={videoFile}
          cover={coverFile}
          setCover={setCustomCover}
          closeModal={closeCustomModal}
        />
      )}

      {editingPost && (
        <EditScheduledPostModal
          post={editingPost}
          closeModal={() => setEditingPost(null)}
          updatePost={(updatedPost) => {
            // suppression de l'ancien post simulée
            setScheduledPosts(prev => prev.filter(p => p !== editingPost).concat(updatedPost));
            setEditingPost(null);
          }}
        />
      )}

    </div>
  );
}
