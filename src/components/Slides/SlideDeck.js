import React, { useState } from 'react'
import Slide from './Slide';
import Slider from '@mui/material/Slider';

const SlideDeck = () => {

    const [currentSlide, setCurrentSlide] = useState(0);
    
    const nextSlide = () => {
        setCurrentSlide(currentSlide + 1);
    }
    const prevSlide = () => {
        setCurrentSlide(currentSlide - 1);
    }

    const [priceRange, setPriceRange] = useState([5000, 15000]);
    const handleChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    switch (currentSlide) {
        case 0:
            return (
                <Slide welcome prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Welcome to Happy Travels!</p>
                        <p>Excited to explore the many cities of Europe?</p>
                        <p>Click below to get started!</p>
                    </div>
                </Slide>
            );
        case 1:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>But wait...</p>
                        <p>First you need to find a place to stay...</p>
                        <p>Lucky for you, Happy Travels is commited to helping you understand the Airbnb market in Europe</p>
                        <p>We have a quiz filled with helpful questions and visualizations to help you find the perfect European city to stay in</p>
                        <p>So with that said, let's begin!</p>
                    </div>
                </Slide>
            )
        case 2: // Price Range: 39.54 - 21083.39 avg 318.18
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Airbnb Pricing</p>
                        <p>Airbnb prices in Europe can vary greatly from city to city</p>
                        <p>When travelling, what are the lowest and highest prices you're willing to pay?</p>
                        <p>Select the price range that best suits your budget below</p>
                        <Slider
                            sx={{ color: 'black' }}
                            getAriaLabel={() => 'Price range'}
                            value={priceRange}
                            onChange={handleChange}
                            valueLabelDisplay="auto"
                            min={39.54}
                            max={21083.39}
                            valueLabelFormat={value => `$${value}`}
                        />
                        <p>Lowest Price: ${priceRange[0]}</p>
                        <p>Highest Price: ${priceRange[1]}</p>
                    </div>
                </Slide>
            );
        case 3:
            return (
                <Slide end prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Visualization for Price</p>
                    </div>
                </Slide>
            )
    }
}

export default SlideDeck