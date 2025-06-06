/* components/SlideDeck.js */
import React, { useState, useEffect } from 'react';
import Slide from './Slide';
import ProgressBar from '../ProgressBar';
import WeekdayWeekendChart from '../Visualizations/WeekdayWeekendChart';
import PriceHistogramChart from '../Visualizations/PriceHistogramChart';
import CityCleanlinessBarChart from '../Visualizations/CityCleanlinessBarChart';
import MetroDistanceCDFChart from '../Visualizations/MetroDistanceCDFChart';
import CityCenterDistanceDotPlot from '../Visualizations/CityCenterDistanceDotPlot';
import CitySatisfactionChart from '../Visualizations/CitySatisfactionChart';
import RoomTypeBreakdownChart from '../Visualizations/RoomTypeBreakdownChart';
import SuperhostDistributionChart from '../Visualizations/SuperhostDistributionChart';
import PersonCapacityChart from '../Visualizations/PersonCapacityChart';
import Confetti from 'react-dom-confetti';

import Slider from '@mui/material/Slider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { useRouter } from 'next/navigation';
import { getCityMatch } from '@/util/functions';
import Link from 'next/link';

const SlideDeck = () => {
  /* ────────── constants ────────── */
  const totalSlides = 21;                                   // keep in sync
  const gradient = 'airbnb-gradient';
  
  // Common styles
  const questionHeaderClass = "text-[#E51D51] text-lg font-normal mb-4 text-left w-full";
  const questionTitleClass = "text-[40px] font-normal mb-12 text-left w-full leading-tight";
  const formGroupClass = "form-group w-full mb-12";
  const nextButtonClass = `${gradient} px-6 py-1.5 rounded-full text-white text-base font-normal shadow hover:opacity-90 transition-all duration-200 focus:outline-none`;

  /* ────────── navigation state ────────── */
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction,    setDirection]    = useState('next');

  // Confetti state
  const [confettiActive, setConfettiActive] = useState(false);

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

  /* ────────── keyboard navigation ────────── */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === 'Return') {
        if (currentSlide < totalSlides - 1 && currentSlide !== 18) { // Don't trigger on final slide
          event.preventDefault(); // Prevent default behavior
          nextSlide();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // Using capture phase
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [currentSlide, nextSlide]); // Added nextSlide to dependencies

  /* ────────── question state (unchanged) ────────── */
  const [weekday, setWeekday]= useState(true);
  const [price, setPrice] = useState(300);
  const [cleanlinessValue,   setCleanlinessValue] = useState(6);
  const [distance, setDistance] = useState(12);
  const [metroDistance, setMetroDistance] = useState(1.5);
  const [roomType, setRoomType] = useState('');
  const [superhostPreference, setSuperhostPreference]= useState('');
  const [personCapacity, setPersonCapacity] = useState(0);
  const [satisfactionScore, setSatisfactionScore] = useState(50);
  const [importance, setImportance] = useState({
    price: 5,
    cleanliness: '',
    distance: '',
    roomType: '',
    superhost: '',
    capacity: '',
    satisfaction: '',
    metro: '',
  });

  /* ────────── handler helpers ────────── */
  const handleCleanlinessChange = (e, v) => setCleanlinessValue(v);
  const handleMetroDistanceChange = (e, v) => setMetroDistance(v);
  const handleSatisfactionChange = (e, v) => setSatisfactionScore(v);

  /* progress for <ProgressBar/> (0 → 1) */
  const progress = currentSlide / (totalSlides - 1);

  // Confetti effect for final slide
  useEffect(() => {
    if (currentSlide === 18) {
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 2000);
    }
  }, [currentSlide]);

  useEffect(() => {
    if (confettiActive) {
      document.body.classList.add('no-horizontal-scroll');
    } else {
      document.body.classList.remove('no-horizontal-scroll');
    }
    return () => document.body.classList.remove('no-horizontal-scroll');
  }, [confettiActive]);

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
            <div className="flex flex-row items-center justify-center h-full w-full bg-white p-8">
              <div className="flex flex-col justify-center w-1/2 h-full pl-12">
                <img src="/logo.png" alt="Airbnb Logo" className="w-20 mb-8" />
                <h1 className="text-[60px] font-[500] leading-[1.1] font-normal">
                  Plan your perfect<br />European stay
                </h1>
                <p className="text-lg text-gray-500 mt-6 mb-8">
                  We'll ask a few quick questions and show you how your picks compare to other travelers
                </p>
                <button
                  onClick={nextSlide}
                  className={`${gradient} cursor-pointer text-white px-6 py-2 rounded-full shadow hover:opacity-90 transition w-fit`}
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
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <h2 className={questionTitleClass}>But wait...</h2>
                <p className="text-base text-gray-600 mb-6">First you need to find a place to stay!</p>
                <p className="text-base text-gray-600 mb-6">
                  Lucky for you, <span className="font-semibold">Happy Travels</span> is committed to helping you understand the Airbnb market in Europe. We have a quiz filled with helpful questions and visualizations to help you find the perfect European city to stay in.
                </p>
                <p className="text-base text-gray-600 mb-8">So with that said, let's begin!</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 2 (Was Question 1 - Weekday/Weekend) ────────────────────────────────── */
      case 2:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <span className={questionHeaderClass}>Question 1</span>
                <h2 className={questionTitleClass}>
                  Is this for a weekday or a weekend?
                </h2>
                <div className={formGroupClass}>
                  <div className="flex bg-gray-100 rounded-xl p-1 w-[220px]">
                    <div
                      onClick={() => setWeekday(true)}
                      className={`flex-1 text-center py-3 rounded-lg font-normal cursor-pointer transition-all duration-200
                        ${weekday ? 'bg-white shadow text-black' : 'text-black'}`}
                    >
                      Weekday
                    </div>
                    <div
                      onClick={() => setWeekday(false)}
                      className={`flex-1 text-center py-3 rounded-lg font-normal cursor-pointer transition-all duration-200
                        ${!weekday ? 'bg-white shadow text-black' : 'text-black'}`}
                    >
                      Weekend
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 3 (Was WeekdayWeekendChart Visualization) ────────────────────────────────── */
      case 3:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            next={nextSlide}
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                <WeekdayWeekendChart weekday={weekday} />
                <div className="flex justify-start w-full mt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={nextSlide} className={nextButtonClass}>
                      Next
                    </button>
                    <span className="text-sm text-gray-400">Press enter</span>
                  </div>
                </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <span className={questionHeaderClass}>Question 2</span>
                <h2 className={questionTitleClass}>
                  What is your Max nightly<br />budget ($)
                </h2>
                <div className={formGroupClass}>
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
                    value={price}
                    onChange={(e, v) => setPrice(v)}
                    valueLabelDisplay="auto"
                    min={20}
                    max={650}
                    valueLabelFormat={(v) => `$${v}`}
                  />
                  <div className="flex justify-between text-gray-400 text-base mt-4">
                    <span>$20</span>
                    <span>$650</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                <PriceHistogramChart userMaxPrice={price} />
                <div className="flex justify-start w-full mt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={nextSlide} className={nextButtonClass}>
                      Next
                    </button>
                    <span className="text-sm text-gray-400">Press enter</span>
                  </div>
                </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <span className={questionHeaderClass}>Question 3</span>
                <h2 className={questionTitleClass}>
                  Minimum cleanliness score?
                </h2>
                <div className={formGroupClass}>
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
                  <FormControl
                    sx={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      '.MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fff',
                        '& fieldset': {
                          borderColor: '#e5e5e5',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E51D51',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E51D51',
                          borderWidth: '2px',
                        },
                      },
                      '.MuiInputLabel-root': {
                        color: '#888',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        '&.Mui-focused': {
                          color: '#E51D51',
                        },
                      },
                      '.MuiSelect-icon': {
                        color: '#E51D51',
                      },
                    }}
                  >
                    <InputLabel>Select Value</InputLabel>
                    <Select
                      value={importance.cleanliness}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, cleanliness: e.target.value })}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          },
                        },
                      }}
                    >
                      <MenuItem value={5} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>5 - Very Important</MenuItem>
                      <MenuItem value={4} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>2 - Not Important</MenuItem>
                      <MenuItem value={1} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                <CityCleanlinessBarChart userMinCleanliness={cleanlinessValue} />
                <div className="flex justify-start w-full mt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={nextSlide} className={nextButtonClass}>
                      Next
                    </button>
                    <span className="text-sm text-gray-400">Press enter</span>
                  </div>
                </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <span className={questionHeaderClass}>Question 4</span>
                <h2 className={questionTitleClass}>
                  Max walk to nearest<br />metro (km)
                </h2>
                <div className={formGroupClass}>
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
                  <FormControl
                    sx={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      '.MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fff',
                        '& fieldset': {
                          borderColor: '#e5e5e5',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E51D51',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E51D51',
                          borderWidth: '2px',
                        },
                      },
                      '.MuiInputLabel-root': {
                        color: '#888',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        '&.Mui-focused': {
                          color: '#E51D51',
                        },
                      },
                      '.MuiSelect-icon': {
                        color: '#E51D51',
                      },
                    }}
                  >
                    <InputLabel>Select Value</InputLabel>
                    <Select
                      value={importance.metro}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, metro: e.target.value })}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          },
                        },
                      }}
                    >
                      <MenuItem value={5} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>5 - Very Important</MenuItem>
                      <MenuItem value={4} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>2 - Not Important</MenuItem>
                      <MenuItem value={1} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                <MetroDistanceCDFChart userMetroDistance={metroDistance} />
                <div className="flex justify-start w-full mt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={nextSlide} className={nextButtonClass}>
                      Next
                    </button>
                    <span className="text-sm text-gray-400">Press enter</span>
                  </div>
                </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <span className={questionHeaderClass}>Question 6</span>
                <h2 className={questionTitleClass}>
                  Minimum guest satisfaction score?
                </h2>
                <div className={formGroupClass}>
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
                  <FormControl
                    sx={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      '.MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fff',
                        '& fieldset': {
                          borderColor: '#e5e5e5',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E51D51',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E51D51',
                          borderWidth: '2px',
                        },
                      },
                      '.MuiInputLabel-root': {
                        color: '#888',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        '&.Mui-focused': {
                          color: '#E51D51',
                        },
                      },
                      '.MuiSelect-icon': {
                        color: '#E51D51',
                      },
                    }}
                  >
                    <InputLabel>Select Value</InputLabel>
                    <Select
                      value={importance.satisfaction}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, satisfaction: e.target.value })}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          },
                        },
                      }}
                    >
                      <MenuItem value={5} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>5 - Very Important</MenuItem>
                      <MenuItem value={4} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>2 - Not Important</MenuItem>
                      <MenuItem value={1} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                <CitySatisfactionChart userMinSatisfaction={satisfactionScore} />
                <div className="flex justify-start w-full mt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={nextSlide} className={nextButtonClass}>
                      Next
                    </button>
                    <span className="text-sm text-gray-400">Press enter</span>
                  </div>
                </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <span className={questionHeaderClass}>Question 7</span>
                <h2 className={questionTitleClass}>
                  Preferred room type?
                </h2>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select the room type that best fits your needs</label>
                  <FormControl
                    sx={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      '.MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fff',
                        '& fieldset': {
                          borderColor: '#e5e5e5',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E51D51',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E51D51',
                          borderWidth: '2px',
                        },
                      },
                      '.MuiInputLabel-root': {
                        color: '#888',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        '&.Mui-focused': {
                          color: '#E51D51',
                        },
                      },
                      '.MuiSelect-icon': {
                        color: '#E51D51',
                      },
                    }}
                  >
                    <InputLabel>Select Room Type</InputLabel>
                    <Select
                      value={roomType}
                      label="Select Room Type"
                      onChange={(e) => setRoomType(e.target.value)}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          },
                        },
                      }}
                    >
                      <MenuItem value="entire_place">Entire Place</MenuItem>
                      <MenuItem value="private_room">Private Room</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is room type to you?</label>
                  <FormControl
                    sx={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      '.MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fff',
                        '& fieldset': {
                          borderColor: '#e5e5e5',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E51D51',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E51D51',
                          borderWidth: '2px',
                        },
                      },
                      '.MuiInputLabel-root': {
                        color: '#888',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        '&.Mui-focused': {
                          color: '#E51D51',
                        },
                      },
                      '.MuiSelect-icon': {
                        color: '#E51D51',
                      },
                    }}
                  >
                    <InputLabel>Select Value</InputLabel>
                    <Select
                      value={importance.roomType}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, roomType: e.target.value })}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          },
                        },
                      }}
                    >
                      <MenuItem value={5} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>5 - Very Important</MenuItem>
                      <MenuItem value={4} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>2 - Not Important</MenuItem>
                      <MenuItem value={1} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
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
            <div className="w-full max-w-[700px] mx-auto px-4 pb-12">
              <RoomTypeBreakdownChart userSelectedRoomType={roomType} />
              <div className="flex justify-start w-full mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <span className={questionHeaderClass}>Question 8</span>
                <h2 className={questionTitleClass}>
                  Superhost status preference?
                </h2>
                <p className="text-base text-gray-600 mb-8 text-left w-full">
                  Airbnb's Superhost program recognizes hosts who provide exceptional hospitality and customer service. Approximately 30% of Airbnb listings in Europe are hosted by Superhosts. Would you like to stay with a Superhost for a more guaranteed quality experience?
                </p>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select your preference</label>
                  <FormControl
                    sx={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      '.MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fff',
                        '& fieldset': {
                          borderColor: '#e5e5e5',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E51D51',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E51D51',
                          borderWidth: '2px',
                        },
                      },
                      '.MuiInputLabel-root': {
                        color: '#888',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        '&.Mui-focused': {
                          color: '#E51D51',
                        },
                      },
                      '.MuiSelect-icon': {
                        color: '#E51D51',
                      },
                    }}
                  >
                    <InputLabel>Select Preference</InputLabel>
                    <Select
                      value={superhostPreference}
                      label="Select Preference"
                      onChange={(e) => setSuperhostPreference(e.target.value)}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          },
                        },
                      }}
                    >
                      <MenuItem value="superhost_only">Yes, only show Superhost listings</MenuItem>
                      <MenuItem value="all_listings">No, include all listings</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is Superhost status to you?</label>
                  <FormControl
                    sx={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      '.MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fff',
                        '& fieldset': {
                          borderColor: '#e5e5e5',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E51D51',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E51D51',
                          borderWidth: '2px',
                        },
                      },
                      '.MuiInputLabel-root': {
                        color: '#888',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        '&.Mui-focused': {
                          color: '#E51D51',
                        },
                      },
                      '.MuiSelect-icon': {
                        color: '#E51D51',
                      },
                    }}
                  >
                    <InputLabel>Select Value</InputLabel>
                    <Select
                      value={importance.superhost}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, superhost: e.target.value })}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          },
                        },
                      }}
                    >
                      <MenuItem value={5} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>5 - Very Important</MenuItem>
                      <MenuItem value={4} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>2 - Not Important</MenuItem>
                      <MenuItem value={1} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
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
            <div className="w-full max-w-[700px] mx-auto px-4 pb-12">
              <SuperhostDistributionChart userSuperhostPreference={superhostPreference} />
              <div className="flex justify-start w-full mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
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
            <div className="flex flex-col items-center justify-center h-full w-full p-0">
              <div className="flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-4">
                <span className={questionHeaderClass}>Question 9</span>
                <h2 className={questionTitleClass}>
                  Preferred person capacity?
                </h2>
                <p className="text-base text-gray-600 mb-8 text-left w-full">
                  Airbnb accommodations in Europe cater to a wide range of group sizes, from solo travelers to large families or groups of friends. The average person capacity for Airbnb listings in Europe is 4 people. How many people will be traveling with you?
                </p>
                <div className="mb-8 max-w-md w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select your group size</label>
                  <div className="w-[100px] outline-[#a6a6a6] h-[35px] outline-[0.5] px-[10px] rounded-md flex items-center justify-around">
                    <p
                      onClick={() => setPersonCapacity(personCapacity > 0 ? personCapacity - 1 : 0)}
                      className="cursor-pointer text-md"
                    >
                      -
                    </p>
                    <div className="w-[30px] h-[30px] flex justify-center items-center rounded-sm outline-[#a6a6a6] outline-[0.5] bg-white">
                      <p className="text-md">{personCapacity}</p>
                    </div>
                    <p
                      onClick={() => setPersonCapacity(personCapacity < 6 ? personCapacity + 1 : 6)}
                      className="cursor-pointer text-md"
                    >
                      +
                    </p>
                  </div>
                </div>
                <div className="max-w-xs w-full mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is person capacity to you?</label>
                  <FormControl
                    sx={{
                      width: '100%',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      '.MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fff',
                        '& fieldset': {
                          borderColor: '#e5e5e5',
                        },
                        '&:hover fieldset': {
                          borderColor: '#E51D51',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E51D51',
                          borderWidth: '2px',
                        },
                      },
                      '.MuiInputLabel-root': {
                        color: '#888',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        '&.Mui-focused': {
                          color: '#E51D51',
                        },
                      },
                      '.MuiSelect-icon': {
                        color: '#E51D51',
                      },
                    }}
                  >
                    <InputLabel>Select Value</InputLabel>
                    <Select
                      value={importance.capacity}
                      label="Select Value"
                      onChange={(e) => setImportance({ ...importance, capacity: e.target.value })}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          },
                        },
                      }}
                    >
                      <MenuItem value={5} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>5 - Very Important</MenuItem>
                      <MenuItem value={4} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>4 - Pretty Important</MenuItem>
                      <MenuItem value={3} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>3 - Somewhat Important</MenuItem>
                      <MenuItem value={2} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>2 - Not Important</MenuItem>
                      <MenuItem value={1} sx={{ fontSize: '1rem', '&.Mui-selected': { backgroundColor: '#FCE4EC', color: '#E51D51' }, '&:hover': { backgroundColor: '#F8BBD0' } }}>1 - Don't Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
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
            <div className="w-full max-w-[700px] mx-auto px-4 pb-12">
              <PersonCapacityChart userSelectedCapacity={personCapacity} />
              <div className="flex justify-start w-full mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={nextSlide} className={nextButtonClass}>
                    Next
                  </button>
                  <span className="text-sm text-gray-400">Press enter</span>
                </div>
              </div>
            </div>
          </Slide>
        );

      /* ────────────────────────────────── 18 (final slide) ────────────────────────────────── */
      case 18:
        return (
          <Slide
            key={currentSlide}
            motionKey={currentSlide}
            end
            prev={prevSlide}
            direction={direction}
          >
            <div className="flex flex-col items-center justify-center h-full w-full relative">
              {/* Centered Confetti */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}>
                <Confetti
                  active={confettiActive}
                  config={{
                    angle: 90,
                    spread: 180,
                    startVelocity: 45,
                    elementCount: 250,
                    dragFriction: 0.08,
                    duration: 2500,
                    stagger: 1,
                    width: "10px",
                    height: "10px",
                    perspective: "500px",
                    colors: ["#E51D51", "#F8BBD0"]
                  }}
                />
              </div>
              <div className="flex flex-col items-start justify-center" style={{ minHeight: '60vh' }}>
                <h1 className="text-[2.5rem] md:text-[2.8rem] font-semibold text-black mb-8 leading-tight">
                  That's it, your top cities<br />
                  <span className="block text-left">are ready!</span>
                </h1>
                <button
                  className="bg-[#E51D51] hover:bg-[#c21844] text-white px-8 py-3 rounded-full text-lg font-medium shadow transition-all duration-200 focus:outline-none mt-2"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => {
                    const hasEmpty = Object.keys(importance).some((key) => importance[key] === '');
                    if (hasEmpty) {
                      alert('Missing an importance value, please fill them all out!');
                    } else {
                      const queryObj = {
                        weekday:           JSON.stringify(weekday),
                        price:        JSON.stringify(price),
                        distance:          JSON.stringify(metroDistance),
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
                  View Now
                </button>
              </div>
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
