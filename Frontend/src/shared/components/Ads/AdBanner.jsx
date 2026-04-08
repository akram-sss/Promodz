import React, { useState, useEffect } from 'react'
import './AdBanner.css'
import { adAPI } from '@shared/api'

// Simple in-memory cache so the same slot doesn't re-fetch on every render
const adCache = {}

export default function AdBanner({ adId, variant = 'default' }) {
  const [ad, setAd] = useState(adCache[adId] || null)
  const [loaded, setLoaded] = useState(!!adCache[adId])

  useEffect(() => {
    if (adCache[adId]) {
      setAd(adCache[adId])
      setLoaded(true)
      return
    }

    let cancelled = false

    const fetchAd = async () => {
      try {
        const res = await adAPI.getByPosition(adId)
        const ads = res.data?.ads || []
        const found = ads[0] || null // take the first active ad for this slot
        if (!cancelled) {
          adCache[adId] = found
          setAd(found)
          setLoaded(true)
        }
      } catch {
        if (!cancelled) setLoaded(true)
      }
    }

    fetchAd()
    return () => { cancelled = true }
  }, [adId])

  if (!loaded) {
    return (
      <div className={`ad-banner ad-banner-${variant} ad-placeholder`}>
        <div className="ad-placeholder-content">
          <span className="ad-placeholder-icon">⏳</span>
          <span className="ad-placeholder-text">Loading...</span>
        </div>
      </div>
    )
  }

  if (!ad || !ad.imageUrl) {
    return (
      <div className={`ad-banner ad-banner-${variant} ad-placeholder`}>
        <div className="ad-placeholder-content">
          <span className="ad-placeholder-icon">📢</span>
          <span className="ad-placeholder-text">Ad Space</span>
        </div>
      </div>
    )
  }

  const handleClick = () => {
    if (ad.link) {
      // Track click asynchronously — don't block navigation
      adAPI.trackClick(ad.id).catch(() => {})
      window.open(ad.link, '_blank', 'noopener,noreferrer')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`ad-banner ad-banner-${variant} ${ad.link ? 'ad-clickable' : ''}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role={ad.link ? 'button' : 'img'}
      tabIndex={ad.link ? 0 : -1}
      aria-label={ad.link ? 'Advertisement - Click to visit' : 'Advertisement'}
      style={{ cursor: ad.link ? 'pointer' : 'default' }}
    >
      <img
        src={ad.imageUrl}
        alt={ad.title || 'Advertisement'}
        className="ad-image"
      />
      <div className="ad-overlay">
        <span className="ad-label">SPONSORED</span>
        {ad.link && (
          <span className="ad-click-hint">Click to visit →</span>
        )}
      </div>
    </div>
  )
}
