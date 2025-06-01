"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getCityMatch } from '@/util/functions'
import Link from 'next/link'

const page = () => {
    const searchParams = useSearchParams()
    const [topCities, setTopCities] = useState([])

    useEffect(() => {
        if (!searchParams) return

        const weekday = searchParams.get('weekday') === 'true'
        const priceRange = searchParams.get('priceRange')
            ? JSON.parse(searchParams.get('priceRange'))
            : []
        const cleanlinessValue = parseInt(searchParams.get('cleanlinessValue'))
        const distanceRange = searchParams.get('distanceRange')
            ? JSON.parse(searchParams.get('distanceRange'))
            : []
        const superhostPreference = searchParams.get('superhostPreference') || ''
        const personCapacity = searchParams.get('personCapacity')
            ? JSON.parse(searchParams.get('personCapacity'))
            : []
        const satisfactionScore = parseInt(searchParams.get('satisfactionScore'))
        const importance = searchParams.get('importance')
            ? JSON.parse(searchParams.get('importance'))
            : {}

        const matches = getCityMatch(
            weekday,
            priceRange,
            cleanlinessValue,
            distanceRange,
            superhostPreference,
            personCapacity,
            satisfactionScore,
            importance
        )

        setTopCities(matches)
    }, [searchParams])
  return (
    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
        {
            topCities.length > 0 ?
                <>
                    <p>Top Cities!</p>
                    <p>1st Place - {topCities[0].city} with a {topCities[0].score}% match</p>
                    <p>2nd Place - {topCities[1].city} with a {topCities[1].score}% match</p>
                    <p>3rd Place - {topCities[2].city} with a {topCities[2].score}% match</p>
                    <p className='text-2xl font-bold'>END</p>
                    <Link href="/slides">
                        <button className='cursor-pointer w-[150px] h-[70px] shadow bg-black text-white'>Back to Quiz</button>
                    </Link>
                    <Link href="/map">
                        <button className='cursor-pointer w-[150px] h-[70px] shadow bg-black text-white'>To Map</button>
                    </Link>
                </>
            :
                <p>Loading...</p>
        }
    </div>
  )
}

export default page