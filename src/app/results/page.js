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
    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
        {
            topCities.length > 0 ?
                <div className='flex flex-col items-center h-full w-[80%] mt-[30px] gap-[20px]'>
                    <div className='flex w-full justify-between'>
                        <div>
                            <p className={`text-[#E51D51] text-[2.5vh]`}>Final Results</p>
                            <p className='text-[5vh]'>Top city matches</p>
                        </div>
                        <div>
                            <Link href={"/"}>
                                <button className={`h-[5vh] w-[15vh] hover:opacity-90 transition-all duration-500 ease-in-out ${gradient} cursor-pointer rounded-full shadow-md`}>
                                    <p className='text-white text-[2vh]'>back to quiz</p>
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className='bg-[#F0F0F0] mt-[20px] w-[80%] h-[500px] rounded-2xl flex justify-center items-end gap-[10%]'>
                        <div className='flex flex-col gap-[20px] w-[11vw] h-[37vh]'>
                            <div className='h-[10vh] shadow w-full hover:scale-105 transition-all duration-100 ease-in-out bg-[#fff] rounded-xl flex items-center justify-center'>
                                <p className='text-[3vh]'>{topCities[1].city}</p>
                            </div>
                            <div className='w-full shadow bg-[#fff] h-full rounded-t-xl flex flex-col items-center'>
                                <p className='mt-[30px] text-[7vh] text-black'>2</p>
                                <p className='text-[2vh] text-black'>{topCities[1].score}% match</p>
                            </div>
                        </div>
                        <div className='flex flex-col gap-[20px] w-[11vw] h-[50vh]'>
                            <div className='h-[10vh] shadow w-full hover:scale-105 transition-all duration-100 ease-in-out bg-[#fff] rounded-xl flex items-center justify-center'>
                                <p className='text-[3vh]'>{topCities[0].city}</p>
                            </div>
                            <div className={`w-full shadow bg-gradient-to-b from-[#E51D51] to-[#D90865] h-full rounded-t-xl flex flex-col items-center`}>
                                <p className='mt-[30px] text-[7vh] text-white'>1</p>
                                <p className='text-[2vh] text-white'>{topCities[0].score}% match</p>
                            </div>
                        </div>
                        <div className='flex flex-col gap-[20px] w-[11vw] h-[30vh]'>
                            <div className='h-[10vh] shadow w-full hover:scale-105 transition-all duration-100 ease-in-out bg-[#fff] rounded-xl flex items-center justify-center'>
                                <p className='text-[3vh]'>{topCities[2].city}</p>
                            </div>
                            <div className='w-full shadow bg-[#fff] h-full rounded-t-xl flex flex-col items-center'>
                                <p className='mt-[30px] text-[7vh] text-black'>3</p>
                                <p className='text-[2vh] text-black'>{topCities[2].score}% match</p>
                            </div>
                        </div>
                    </div>
                    <Link
                    href={{pathname: "/map", query: {
                        top1: topCities[0]?.city,
                        top2: topCities[1]?.city,
                        top3: topCities[2]?.city,
                        },}}>
                        <button className={`h-[5vh] w-[11vh] mt-[20px] cursor-pointer hover:opacity-90 transition-all duration-500 ease-in-out ${gradient} rounded-full shadow-md`}>
                            <p className='text-white text-[2vh]'>To map</p>
                        </button>
                    </Link>
                </div>
            :
                <p>Loading...</p>
        }
    </div>
  )
}

export default page