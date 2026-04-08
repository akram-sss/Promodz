import React from 'react'
import './ProExplo.css'
import AdBanner from '@components/Ads/AdBanner'

export default function ProExplo({text, title, horizontalAdId = 3, squareAdId = 4}) {
  return (
    <div className='ProductsIntro'>
        <div className='productsIntro-left'>
            <div className='ProductsIntro-Text'>
              <h1>{title}</h1>
              <p>{text}</p>
            </div>
            <div className='Products-idk'>
              <AdBanner adId={horizontalAdId} variant="horizontal" />
            </div>
        </div>
        <div className='productsIntro-right'>
            <AdBanner adId={squareAdId} variant="square" />
        </div>
    </div>
  )
}
