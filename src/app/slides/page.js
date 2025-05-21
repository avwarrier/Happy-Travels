"use client"

import Slide from '@/components/Slides/Slide'
import SlideDeck from '@/components/Slides/SlideDeck'
import React, { useState } from 'react'

const page = () => {

    return (
        <div className='flex items-center justify-center h-screen w-screen'>
            <SlideDeck />
        </div>
    )
}

export default page