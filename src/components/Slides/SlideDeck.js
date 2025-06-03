/* components/SlideDeck.js */
import React, { useState } from 'react';
import Slide        from './Slide';
import ProgressBar  from '../ProgressBar';

import Slider        from '@mui/material/Slider';
import InputLabel    from '@mui/material/InputLabel';
import MenuItem      from '@mui/material/MenuItem';
import FormControl   from '@mui/material/FormControl';
import Select        from '@mui/material/Select';

import { useRouter } from 'next/navigation';
import { getCityMatch } from '@/util/functions';
import Link          from 'next/link';

const SlideDeck = () => {
  /* ────────── constants ────────── */
  const totalSlides = 20;                                   // keep in sync
  const gradient    = 'bg-gradient-to-r from-[#E51D51] to-[#D90865]';

  /* ────────── navigation state ────────── */
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction,    setDirection]    = useState('next');

  /* ────────── question state (unchanged) ────────── */
  const [weekday,            setWeekday]            = useState(true);
  const [priceRange,         setPriceRange]         = useState([5000, 15000]);
  const [cleanlinessValue,   setCleanlinessValue]   = useState(6);
  const [distance,           setDistance]           = useState(12);
  const [metroDistance,      setMetroDistance]      = useState(1.5);
  const [roomType,           setRoomType]           = useState('');
  const [superhostPreference,setSuperhostPreference]= useState('');
  const [personCapacity,     setPersonCapacity]     = useState(0);
  const [satisfactionScore,  setSatisfactionScore]  = useState(50);
  const [importance, setImportance] = useState({
    price: 5,
    cleanliness: 4,
    distance: 3,
    roomType: 2,
    superhost: 1,
    capacity: 5,
    satisfaction: 3,
    metro: 3,
  });

  /* ────────── navigation helpers ────────── */
  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setDirection('next');
      setCurrentSlide((s) => s + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection('prev');
      setCurrentSlide((s) => s - 1);
    }
  };

  /* ────────── handler helpers ────────── */
  const handlePriceChange        = (e, v) => setPriceRange(v);
  const handleCleanlinessChange  = (e, v) => setCleanlinessValue(v);
  const handleDistanceChange     = (e, v) => setDistance(v);
  const handleMetroDistanceChange= (e, v) => setMetroDistance(v);
  const handleSatisfactionChange = (e, v) => setSatisfactionScore(v);

  /* progress for <ProgressBar/> (0 → 1) */
  const progress = currentSlide / (totalSlides - 1);

  /* ────────── slide factory ────────── */
  const renderSlide = () => {
    switch (currentSlide) {
      /* ────────────────────────────────── 0 ────────────────────────────────── */
      case 0:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            welcome
            hideNextArrow
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-0 body  */}
            <div className="flex flex-row items-center justify-center h-full w-full bg-white p-8">
              <div className="flex flex-col justify-center w-1/2 h-full pl-8">
                <img src="/logo.png" alt="Airbnb Logo" className="w-20 mb-8" />
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  Plan your perfect <br /> European stay
                </h1>
                <p className="text-lg text-gray-500 mb-8">
                  We'll ask a few quick questions and show you how your picks compare to other travelers
                </p>
                <button
                  onClick={nextSlide}
                  className="bg-black cursor-pointer text-white px-6 py-2 rounded-full shadow hover:bg-gray-900 transition w-fit"
                >
                  Get Started
                </button>
              </div>
              <div className="flex justify-center items-center w-1/2 h-full">
                <img src="/pic1.png" alt="Rooms" className="max-w-full max-h-[800px] object-contain" />
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 1 ────────────────────────────────── */
      case 1:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-1 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto text-left">
                <h2 className="text-[#E51D51] text-4xl font-extrabold mb-4">But wait...</h2>
                <p className="text-base text-gray-600 mb-4">First you need to find a place to stay!</p>
                <p className="text-base text-gray-600 mb-4">
                  Lucky for you, <span className="font-semibold">Happy Travels</span> is committed to helping you understand the Airbnb market in Europe. We have a quiz filled with helpful questions and visualizations to help you find the perfect European city to stay in.
                </p>
                <p className="text-base text-gray-600 mb-8">So with that said, let's begin!</p>
                <button
                  onClick={nextSlide}
                  className="mt-2 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 2 ────────────────────────────────── */
      case 2:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-2 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 1</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  Is this for a weekday or a weekend?
                </h2>
                <div className="flex flex-row gap-4 mb-8">
                  <div className="flex bg-gray-100 rounded-xl p-1 w-[220px]">
                    <div
                      onClick={() => setWeekday(true)}
                      className={`flex-1 text-center py-2 rounded-lg font-semibold cursor-pointer transition-all duration-200
                        ${weekday ? 'bg-white shadow text-black' : 'text-black'}`}
                    >
                      Weekday
                    </div>
                    <div
                      onClick={() => setWeekday(false)}
                      className={`flex-1 text-center py-2 rounded-lg font-semibold cursor-pointer transition-all duration-200
                        ${!weekday ? 'bg-white shadow text-black' : 'text-black'}`}
                    >
                      Weekend
                    </div>
                  </div>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-2 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 3 ────────────────────────────────── */
      case 3:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-3 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 2</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  What is your Max nightly<br />budget (€)
                </h2>
                <div className="w-full mb-8">
                  <Slider
                    sx={{
                      color: '#191919',
                      height: 6,
                      '& .MuiSlider-thumb': {
                        width: 24,
                        height: 24,
                        backgroundColor: '#fff',
                        border: '2px solid #191919',
                      },
                      '& .MuiSlider-rail': { backgroundColor: '#f3f3f3', height: 6 },
                      '& .MuiSlider-track': { backgroundColor: '#191919', height: 6 },
                    }}
                    getAriaLabel={() => 'Price range'}
                    value={priceRange[1]}
                    onChange={(e, v) => setPriceRange([priceRange[0], v])}
                    valueLabelDisplay="auto"
                    min={30}
                    max={800}
                    valueLabelFormat={(v) => `${v}€`}
                  />
                  <div className="flex justify-between text-gray-400 text-base mt-2">
                    <span>30€</span>
                    <span>800€</span>
                  </div>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-2 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 4 ────────────────────────────────── */
      case 4:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center h-full w-full p-[30px]">
              <p className="text-2xl font-bold">Visualization for Price</p>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 5 ────────────────────────────────── */
      case 5:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-5 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 3</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  Minimum cleanliness score?
                </h2>
                <div className="w-full mb-8">
                  <Slider
                    sx={{
                      color: '#191919',
                      height: 6,
                      '& .MuiSlider-thumb': {
                        width: 24,
                        height: 24,
                        backgroundColor: '#fff',
                        border: '2px solid #191919',
                      },
                      '& .MuiSlider-rail': { backgroundColor: '#f3f3f3', height: 6 },
                      '& .MuiSlider-track': { backgroundColor: '#191919', height: 6 },
                    }}
                    getAriaLabel={() => 'Cleanliness value'}
                    value={cleanlinessValue}
                    onChange={handleCleanlinessChange}
                    valueLabelDisplay="auto"
                    min={2}
                    max={10}
                    valueLabelFormat={(v) => `${v}`}
                  />
                  <div className="flex justify-between text-gray-500 text-sm mt-2">
                    <span>2</span>
                    <span>10</span>
                  </div>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is cleanliness to you?</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Value</InputLabel>
                    <Select
                      value={importance.cleanliness}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, cleanliness: e.target.value })}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value={5}>5 - Very Important</MenuItem>
                      <MenuItem value={4}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2}>2 - Not Important</MenuItem>
                      <MenuItem value={1}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-6 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 6 ────────────────────────────────── */
      case 6:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center h-full w-full p-[30px]">
              <p className="text-2xl font-bold">Visualization for cleanliness score</p>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 7 ────────────────────────────────── */
      case 7:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-7 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 4</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  Max walk to nearest<br />metro (km)
                </h2>
                <div className="w-full mb-8">
                  <Slider
                    sx={{
                      color: '#191919',
                      height: 6,
                      '& .MuiSlider-thumb': {
                        width: 24,
                        height: 24,
                        backgroundColor: '#fff',
                        border: '2px solid #191919',
                      },
                      '& .MuiSlider-rail': { backgroundColor: '#f3f3f3', height: 6 },
                      '& .MuiSlider-track': { backgroundColor: '#191919', height: 6 },
                    }}
                    getAriaLabel={() => 'Metro distance range'}
                    value={metroDistance}
                    onChange={handleMetroDistanceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={3}
                    step={0.01}
                    valueLabelFormat={(v) => `${v} km`}
                  />
                  <div className="flex justify-between text-gray-500 text-sm mt-2">
                    <span>0 km</span>
                    <span>3 km</span>
                  </div>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is metro distance to you?</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Value</InputLabel>
                    <Select
                      value={importance.metro}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, metro: e.target.value })}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value={5}>5 - Very Important</MenuItem>
                      <MenuItem value={4}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2}>2 - Not Important</MenuItem>
                      <MenuItem value={1}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-6 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 8 ────────────────────────────────── */
      case 8:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center h-full w-full p-[30px]">
              <p className="text-2xl font-bold">Visualization for Max walk to nearest metro (km)</p>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 9 ────────────────────────────────── */
      case 9:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-9 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 5</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  Max distance to city<br />centre (km)
                </h2>
                <div className="w-full mb-8">
                  <Slider
                    sx={{
                      color: '#191919',
                      height: 6,
                      '& .MuiSlider-thumb': {
                        width: 24,
                        height: 24,
                        backgroundColor: '#fff',
                        border: '2px solid #191919',
                      },
                      '& .MuiSlider-rail': { backgroundColor: '#f3f3f3', height: 6 },
                      '& .MuiSlider-track': { backgroundColor: '#191919', height: 6 },
                    }}
                    getAriaLabel={() => 'Distance range'}
                    value={distance}
                    onChange={handleDistanceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={25.28}
                    valueLabelFormat={(v) => `${v} km`}
                  />
                  <div className="flex justify-between text-gray-500 text-sm mt-2">
                    <span>0 km</span>
                    <span>25 km</span>
                  </div>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is distance to city centre to you?</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Value</InputLabel>
                    <Select
                      value={importance.distance}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, distance: e.target.value })}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value={5}>5 - Very Important</MenuItem>
                      <MenuItem value={4}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2}>2 - Not Important</MenuItem>
                      <MenuItem value={1}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-6 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 10 ────────────────────────────────── */
      case 10:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center h-full w-full p-[30px]">
              <p className="text-2xl font-bold">Visualization for Distance</p>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 11 ────────────────────────────────── */
      case 11:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-11 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 6</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  Minimum guest satisfaction score?
                </h2>
                <div className="w-full mb-8">
                  <Slider
                    sx={{
                      color: '#191919',
                      height: 6,
                      '& .MuiSlider-thumb': {
                        width: 24,
                        height: 24,
                        backgroundColor: '#fff',
                        border: '2px solid #191919',
                      },
                      '& .MuiSlider-rail': { backgroundColor: '#f3f3f3', height: 6 },
                      '& .MuiSlider-track': { backgroundColor: '#191919', height: 6 },
                    }}
                    getAriaLabel={() => 'Satisfaction score range'}
                    value={satisfactionScore}
                    onChange={handleSatisfactionChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    valueLabelFormat={(v) => `${v}%`}
                  />
                  <div className="flex justify-between text-gray-500 text-sm mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is guest satisfaction score to you?</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Value</InputLabel>
                    <Select
                      value={importance.satisfaction}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, satisfaction: e.target.value })}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value={5}>5 - Very Important</MenuItem>
                      <MenuItem value={4}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2}>2 - Not Important</MenuItem>
                      <MenuItem value={1}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-6 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 12 ────────────────────────────────── */
      case 12:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center h-full w-full p-[30px]">
              <p className="text-2xl font-bold">Visualization for Guest Satisfaction Score</p>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 13 ────────────────────────────────── */
      case 13:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-13 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 7</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  Preferred room type?
                </h2>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select the room type that best fits your needs</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Room Type</InputLabel>
                    <Select
                      value={roomType}
                      label="Select Room Type"
                      onChange={(e) => setRoomType(e.target.value)}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value="entire_place">Entire Place</MenuItem>
                      <MenuItem value="private_room">Private Room</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is room type to you?</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Value</InputLabel>
                    <Select
                      value={importance.roomType}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, roomType: e.target.value })}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value={5}>5 - Very Important</MenuItem>
                      <MenuItem value={4}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2}>2 - Not Important</MenuItem>
                      <MenuItem value={1}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-6 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 14 ────────────────────────────────── */
      case 14:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center h-full w-full p-[30px]">
              <p className="text-2xl font-bold">Visualization for Room Type</p>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 15 ────────────────────────────────── */
      case 15:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-15 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 8</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  Superhost status preference?
                </h2>
                <p className="text-base text-gray-600 mb-8 text-left w-full">
                  Airbnb's Superhost program recognizes hosts who provide exceptional hospitality and customer service. Approximately 30% of Airbnb listings in Europe are hosted by Superhosts. Would you like to stay with a Superhost for a more guaranteed quality experience?
                </p>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select your preference</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Preference</InputLabel>
                    <Select
                      value={superhostPreference}
                      label="Select Preference"
                      onChange={(e) => setSuperhostPreference(e.target.value)}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value="superhost_only">Yes, only show Superhost listings</MenuItem>
                      <MenuItem value="all_listings">No, include all listings</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is Superhost status to you?</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Value</InputLabel>
                    <Select
                      value={importance.superhost}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, superhost: e.target.value })}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value={5}>5 - Very Important</MenuItem>
                      <MenuItem value={4}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2}>2 - Not Important</MenuItem>
                      <MenuItem value={1}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-6 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 16 ────────────────────────────────── */
      case 16:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center h-full w-full p-[30px]">
              <p className="text-2xl font-bold">Visualization for Superhost</p>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 17 ────────────────────────────────── */
      case 17:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            {/*  existing slide-17 body  */}
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-xl mx-auto">
                <span className="text-[#E51D51] text-lg font-semibold mb-2 text-left w-full">Question 9</span>
                <h2 className="text-4xl font-extrabold mb-4 text-left w-full">
                  Preferred person capacity?
                </h2>
                <p className="text-base text-gray-600 mb-8 text-left w-full">
                  Airbnb accommodations in Europe cater to a wide range of group sizes, from solo travelers to large families or groups of friends. The average person capacity for Airbnb listings in Europe is 4 people. How many people will be traveling with you?
                </p>
                <div className="mb-8 max-w-md w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select your group size</label>
                  <div className="w-[100px] outline-[#a6a6a6] h-[35px] outline-[0.5] px-[10px] rounded-md flex items-center justify-around bg-gray-100">
                    <p
                      onClick={() => setPersonCapacity(personCapacity > 0 ? personCapacity - 1 : 0)}
                      className="cursor-pointer text-2xl font-bold"
                    >
                      -
                    </p>
                    <div className="w-[30px] h-[30px] flex justify-center items-center rounded-sm outline-[#a6a6a6] outline-[0.5] bg-white">
                      <p className="text-lg font-semibold">{personCapacity}</p>
                    </div>
                    <p
                      onClick={() => setPersonCapacity(personCapacity < 6 ? personCapacity + 1 : 6)}
                      className="cursor-pointer text-2xl font-bold"
                    >
                      +
                    </p>
                  </div>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is person capacity to you?</label>
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: 'black' } }}>Select Value</InputLabel>
                    <Select
                      value={importance.capacity}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, capacity: e.target.value })}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                      }}
                    >
                      <MenuItem value={5}>5 - Very Important</MenuItem>
                      <MenuItem value={4}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2}>2 - Not Important</MenuItem>
                      <MenuItem value={1}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <button
                  onClick={nextSlide}
                  className="mt-6 px-8 py-2 rounded-full bg-[#E51D51] text-white text-lg font-semibold shadow hover:bg-[#D90865] transition-all duration-200 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 18 ────────────────────────────────── */
      case 18:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center h-full w-full p-[30px]">
              <p className="text-2xl font-bold">Visualization for Person Capacity</p>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 19 (final slide) ────────────────────────────────── */
      case 19:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            end
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex justify-center items-center h-full w-full p-[30px]">
              <button
                className={`cursor-pointer rounded-xl hover:opacity-90 transition-all duration-500 ease-in-out w-[250px] h-[60px] shadow-md ${gradient} text-white`}
                onClick={() => {
                  const hasEmpty = Object.keys(importance).some((key) => importance[key] === '');
                  if (hasEmpty) {
                    alert('Missing an importance value, please fill them all out!');
                  } else {
                    const queryObj = {
                      weekday:           JSON.stringify(weekday),
                      priceRange:        JSON.stringify(priceRange),
                      distance:          JSON.stringify(distance),
                      personCapacity:    JSON.stringify(personCapacity),
                      cleanlinessValue:  String(cleanlinessValue),
                      satisfactionScore: String(satisfactionScore),
                      superhostPreference: superhostPreference || '',
                      importance:        JSON.stringify(importance),
                    };
                    const search = new URLSearchParams(queryObj).toString();
                    router.push(`/results?${search}`);
                  }
                }}
              >
                Ready to get your top cities?
              </button>
            </div>
          </Slide>
        );

      default:
        return null;
    }
  };

  /* ────────── render ────────── */
  return (
    <>
      <ProgressBar progress={progress} />
      {renderSlide()}
    </>
  );
};

export default SlideDeck;
