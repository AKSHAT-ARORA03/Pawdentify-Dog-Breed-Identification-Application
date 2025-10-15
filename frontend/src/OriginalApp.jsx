import React, { useRef, useState } from 'react'
import logoUrl from './assets/logo.svg'
import puppyHero from './assets/pexels-chevanon-1108099.jpg'
import BREED_DETAILS from './breedDetails'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function OriginalApp(){
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const puppyRef = useRef(null)
  function sanitize(s){
    return (s || '')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/[()]/g, '')
      .replace(/[^a-z0-9 ]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  const ALIASES = {
    'boston terrier': 'Boston Bull (Boston Terrier)',
    'boston bull': 'Boston Bull (Boston Terrier)',
    'german shepherd': 'German Shepherd Dog',
    'german shepherd dog': 'German Shepherd Dog',
    'miniature poodle': 'Miniature Poodle',
    'standard poodle': 'Standard Poodle',
    'english springer spaniel': 'English Springer Spaniel',
    'welsh springer spaniel': 'Welsh Springer Spaniel',
    'pembroke welsh corgi': 'Pembroke Welsh Corgi',
    'afghan hound': 'Afghan Hound',
    'airedale terrier': 'Airedale Terrier',
    'yorkshire terrier': 'Yorkshire Terrier',
    'shetland sheepdog': 'Shetland Sheepdog'
  }
  function getBreedDetails(predicted){
    if(!predicted) return null
    // exact
    if(BREED_DETAILS[predicted]) return BREED_DETAILS[predicted]
    const norm = sanitize(predicted)
    // alias map
    if(ALIASES[norm] && BREED_DETAILS[ALIASES[norm]]){
      return BREED_DETAILS[ALIASES[norm]]
    }
    // try case-insensitive/punctuation-insensitive key match
    const keys = Object.keys(BREED_DETAILS)
    let matchKey = keys.find(k => sanitize(k) === norm)
    if(matchKey) return BREED_DETAILS[matchKey]
    // try substring matches (both directions)
    matchKey = keys.find(k => sanitize(k).includes(norm) || norm.includes(sanitize(k)))
    if(matchKey) return BREED_DETAILS[matchKey]
    return null
  }
  const details = getBreedDetails(result?.breed)

  function onPick(){ fileInputRef.current?.click() }
  function onChange(e){
    setError('')
    const f = e.target.files?.[0]
    if(!f) return
    setFile(f)
    setResult(null)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
  }

  function onHome(){
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onKnowYourDog(){
    onPick()
  }

  // removed 3D tilt

  async function onPredict(){
    if(!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try{
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_BASE}/predict`, { method: 'POST', body: form })
      const data = await res.json()
      if(data.error){ throw new Error(data.error) }
      setResult({ breed: data.predicted_class, confidence: data.confidence })
    }catch(err){
      setError(err.message || 'Prediction failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <img src={logoUrl} className="brand-logo" alt="Pawdentify" />
            <span className="brand-name">Pawdentify</span>
          </div>
          <div className="header-actions">
            <button className="link" onClick={onHome}>Home</button>
            <button className="btn" onClick={onPick}>Scan</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <h1>Know your dog with Pawdentify</h1>
            <p>
              Pawdentify uses advanced deep learning to recognize dog breeds from photos.
              Simple, fast, and accurate — perfect for pet parents and dog lovers.
            </p>
            <div className="cta">
              <button className="btn" onClick={onKnowYourDog}>Know your dog</button>
              <button className="btn primary" onClick={onPick}>Upload image</button>
            </div>
          </div>
          <div className="puppy-hero">
            <img src={puppyHero} alt="Cute puppy" />
          </div>
        </section>

        <section className="upload-section">
          <div className="uploader">
            <p className="uploader-title">Provide a clear photo of your dog</p>
            <div className="uploader-actions">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={onChange}
                hidden
              />
              <button className="btn" onClick={onPick}>Upload Image</button>
              {file && <button className="btn primary" disabled={loading} onClick={onPredict}>{loading ? 'Predicting…' : 'Predict Breed'}</button>}
            </div>

            {(previewUrl || details || result) && (
              <div className="preview-and-details">
                {previewUrl && (
                  <div className="preview-card">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                )}
                {details ? (
                  <div className="about-dog">
                    <h3>About Dog</h3>
                    <div className="about-grid">
                      <div><strong>Breed</strong><span>{result?.breed}</span></div>
                      {details.size && <div><strong>Size</strong><span>{details.size}</span></div>}
                      {details.group && <div><strong>Group</strong><span>{details.group}</span></div>}
                      {details.life_span && <div><strong>Life span</strong><span>{details.life_span}</span></div>}
                      {details.weight_range && <div><strong>Weight</strong><span>{details.weight_range}</span></div>}
                      {details.height_range && <div><strong>Height</strong><span>{details.height_range}</span></div>}
                      {details.energy_level && <div><strong>Energy</strong><span>{details.energy_level}</span></div>}
                      {details.exercise_needs && <div><strong>Exercise</strong><span>{details.exercise_needs}</span></div>}
                      {details.grooming_needs && <div><strong>Grooming</strong><span>{details.grooming_needs}</span></div>}
                      {details.coat_type && <div><strong>Coat</strong><span>{details.coat_type}</span></div>}
                      {details.colors && <div><strong>Colors</strong><span>{details.colors.join(', ')}</span></div>}
                      {details.temperament && <div><strong>Temperament</strong><span>{details.temperament.join(', ')}</span></div>}
                      {details.good_with_kids && <div><strong>Good with kids</strong><span>{details.good_with_kids}</span></div>}
                      {details.good_with_pets && <div><strong>Good with pets</strong><span>{details.good_with_pets}</span></div>}
                      {details.trainability && <div><strong>Trainability</strong><span>{details.trainability}</span></div>}
                      {details.barking_tendency && <div><strong>Barking</strong><span>{details.barking_tendency}</span></div>}
                      {details.origin && <div><strong>Origin</strong><span>{details.origin}</span></div>}
                      {details.bred_for && <div><strong>Bred for</strong><span>{details.bred_for}</span></div>}
                    </div>
                  </div>
                ) : (result && (
                  <div className="about-dog">
                    <h3>About Dog</h3>
                    <div>We couldn't find details for "{result.breed}". Ensure the breed name exists in your details list.</div>
                  </div>
                ))}
              </div>
            )}

            {error && <div className="alert error">{error}</div>}
            {result && (
              <div className="result">
                <div className="breed">{result.breed || 'Unknown'}</div>
                {typeof result.confidence === 'number' && (
                  <div className="confidence">Confidence: {(result.confidence * 100).toFixed(2)}%</div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Pawdentify</footer>
    </div>
  )
}