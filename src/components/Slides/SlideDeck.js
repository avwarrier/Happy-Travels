import React, { useState } from 'react'
import Slide from './Slide';

const SlideDeck = () => {

    const [currentSlide, setCurrentSlide] = useState(0);
    
    const nextSlide = () => {
        setCurrentSlide(currentSlide + 1);
    }
    const prevSlide = () => {
        setCurrentSlide(currentSlide - 1);
    }

    switch (currentSlide) {
        case 0:
            return (
                <Slide welcome prev={prevSlide} next={nextSlide}>
                    Welcome Slide
                </Slide>
            );
        case 1:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    Slide 1
                </Slide>
            );
        case 2:
            return (
                <Slide end prev={prevSlide} next={nextSlide}>
                    Slide 2
                </Slide>
            )
    }
}

export default SlideDeck