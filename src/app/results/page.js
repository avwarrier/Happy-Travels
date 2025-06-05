"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getCityMatch } from '@/util/functions'
import Link from 'next/link'

const page = () => {
    const searchParams = useSearchParams()
    const [topCities, setTopCities] = useState([])
    const gradient = "bg-gradient-to-r from-[#E51D51] to-[#D90865]"

    useEffect(() => {
        if (!searchParams) return

        const weekday = searchParams.get('weekday') === 'true'
        const price = parseInt(searchParams.get('price'))
        const cleanlinessValue = parseInt(searchParams.get('cleanlinessValue'))
        const distance = parseInt(searchParams.get('distance'))
        const superhostPreference = searchParams.get('superhostPreference') || ''
        const personCapacity = parseInt(searchParams.get('personCapacity'))
        console.log(personCapacity)
        const satisfactionScore = parseInt(searchParams.get('satisfactionScore'))
        const importance = searchParams.get('importance')
            ? JSON.parse(searchParams.get('importance'))
            : {}

        const matches = getCityMatch(
            weekday,
            price,
            cleanlinessValue,
            distance,
            superhostPreference,
            personCapacity,
            satisfactionScore,
            importance
        )
        setTopCities(matches)
    }, [searchParams])


    useEffect(() => {
    if (topCities.length >= 3) {
        console.log("Your top cities are, 1", topCities[0].city);
        console.log("Your top cities are, 2", topCities[1].city);
        console.log("Your top cities are, 3", topCities[2].city);
    }
}, [topCities]);

  return (
    <div className='relative flex flex-col items-center min-h-screen w-full bg-white'>
      {/* Top right buttons */}
      <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
        <Link href="/">
          <span className="text-black text-sm font-normal cursor-pointer hover:underline">Start over</span>
        </Link>
        <Link href={{ pathname: "/map", query: topCities.length >= 3 ? {
          top1: topCities[0]?.city,
          top2: topCities[1]?.city,
          top3: topCities[2]?.city,
        } : {} }}>
          <button className="bg-[#E51D51] hover:bg-[#c21844] text-white px-5 py-2 rounded-full text-sm font-medium shadow transition-all duration-200 focus:outline-none">View Map</button>
        </Link>
      </div>

      {/* Main content */}
      <div className='flex flex-col items-center w-full max-w-5xl mt-20 mb-10'>
        <div className='w-full flex flex-col items-start mb-6'>
          <span className='text-[#E51D51] text-base font-medium mb-1'>Final Result</span>
          <h1 className='text-4xl font-semibold text-black'>Top city matches</h1>
        </div>
        {topCities.length > 0 ? (
          <div className='w-full flex flex-col items-center'>
            {/* Podium */}
            <div className='bg-[#F0F0F0] w-full max-w-4xl h-[340px] rounded-2xl flex justify-center items-end gap-8 shadow-sm mb-12'>
              {/* 2nd place */}
              <div className='flex flex-col gap-3 w-40 h-60 items-center'>
                <div className='h-12 w-full shadow bg-white rounded-xl flex items-center justify-center text-lg font-medium'>{topCities[1].city}</div>
                <div className='w-full shadow bg-white h-full rounded-t-xl flex flex-col items-center justify-end pb-4'>
                  <span className='text-4xl text-black mb-1'>2</span>
                  <span className='text-xs text-black'>{topCities[1].score}% match</span>
                </div>
              </div>
              {/* 1st place */}
              <div className='flex flex-col gap-3 w-40 h-80 items-center'>
                <div className='h-12 w-full shadow bg-white rounded-xl flex items-center justify-center text-lg font-medium'>{topCities[0].city}</div>
                <div className='w-full shadow bg-gradient-to-b from-[#E51D51] to-[#D90865] h-full rounded-t-xl flex flex-col items-center justify-end pb-4'>
                  <span className='text-4xl text-white mb-1'>1</span>
                  <span className='text-xs text-white'>{topCities[0].score}% match</span>
                </div>
              </div>
              {/* 3rd place */}
              <div className='flex flex-col gap-3 w-40 h-44 items-center'>
                <div className='h-12 w-full shadow bg-white rounded-xl flex items-center justify-center text-lg font-medium'>{topCities[2].city}</div>
                <div className='w-full shadow bg-white h-full rounded-t-xl flex flex-col items-center justify-end pb-4'>
                  <span className='text-4xl text-black mb-1'>3</span>
                  <span className='text-xs text-black'>{topCities[2].score}% match</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        {/* Thank you card */}
        <div className="w-full max-w-4xl mt-8 bg-white border border-[#E5E7EB] rounded-2xl flex items-center justify-between p-8 shadow-sm">
          <div className="flex flex-col items-start justify-center">
            <span className="text-2xl font-semibold text-black mb-2">Thank you for participating</span>
            <span className="text-sm text-gray-500">We hope you enjoyed the experience and found your perfect city match!</span>
          </div>
          <img src="/arc.png" alt="Arc de Triomphe" className="w-32 h-24 object-contain ml-8" />
        </div>
      </div>
    </div>
  )
}

export default page