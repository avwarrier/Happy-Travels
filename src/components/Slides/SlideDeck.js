import React, { useState } from 'react'
import Slide from './Slide';
import Slider from '@mui/material/Slider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { getCityMatch } from '@/util/functions';
import Link from 'next/link';

const SlideDeck = () => {

    const [currentSlide, setCurrentSlide] = useState(0);
    
    const nextSlide = () => {
        setCurrentSlide(currentSlide + 1);
    }
    const prevSlide = () => {
        setCurrentSlide(currentSlide - 1);
    }

    const [weekday, setWeekday] = useState(true);
    const [priceRange, setPriceRange] = useState([5000, 15000]);
    const [cleanlinessValue, setCleanlinessValue] = useState(6);
    const [distanceRange, setDistanceRange] = useState([7, 18]);
    const [roomType, setRoomType] = useState('');
    const [superhostPreference, setSuperhostPreference] = useState('');
    const [personCapacity, setPersonCapacity] = useState([2, 4]);
    const [satisfactionScore, setSatisfactionScore] = useState(50);
    const [importance, setImportance] = useState({
        price: 5,
        cleanliness: 4,
        distance: 3,
        roomType: 2,
        superhost: 1,
        capacity: 5,
        satisfaction: 4,
        //add more parameters here
    });

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };
    const handleCleanlinessChange = (event, newValue) => {
        setCleanlinessValue(newValue);
    };
    const handleDistanceChange = (event, newValue) => {
        setDistanceRange(newValue);
    };
    const handlePersonCapacityChange = (event, newValue) => {
        setPersonCapacity(newValue);
    };
    const handleSatisfactionChange = (event, newValue) => {
        setSatisfactionScore(newValue);
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
        case 2:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
                        <p className='text-2xl font-bold'>Airbnb Pricing</p>
                        <p>Would you be staying on a weekday or weekend?</p>
                        <FormControl sx={{ width: '20%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Day
                            </InputLabel>
                            <Select
                                value={weekday}
                                label="Select Value"
                                onChange={(event) => {
                                    setWeekday(event.target.value)
                                }}
                                inputProps={{}}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                }}
                            >
                                <MenuItem value={true}>Weekday</MenuItem>
                                <MenuItem value={false}>Weekend</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </Slide>
            );
        case 2:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
                        <p className='text-2xl font-bold'>Airbnb Pricing</p>
                        <p>Airbnb prices in Europe can vary greatly from city to city</p>
                        <p>The average price of an Airbnb in Europe is 279.88 per night</p>
                        <p>When travelling, what are the lowest and highest prices you're willing to pay?</p>
                        <p>Select the price range that best suits your budget below</p>
                        <Slider
                            sx={{ color: 'black' }}
                            getAriaLabel={() => 'Price range'}
                            value={priceRange}
                            onChange={handlePriceChange}
                            valueLabelDisplay="auto"
                            min={34.78}
                            max={18545.45}
                            valueLabelFormat={value => `$${value}`}
                        />
                        <p>Lowest Price: ${priceRange[0]}</p>
                        <p>Highest Price: ${priceRange[1]}</p>
                        <p>How important is price to you?</p>
                        <FormControl sx={{ width: '20%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Value
                            </InputLabel>
                            <Select
                                value={importance.price}
                                label="Select Value"
                                onChange={(event) => {
                                    setImportance({...importance, price: event.target.value})
                                }}
                                inputProps={{}}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
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
                </Slide>
            );
        case 3:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Visualization for Price</p>
                    </div>
                </Slide>
            )
        case 4:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
                        <p className='text-2xl font-bold'>Property Cleanliness</p>
                        <p>Cleanliness is important to many travellers and can be a deal breaker in some cases</p>
                        <p>Different properties have different cleanliness ratings with an average of 9.39/10 (really high!)</p>
                        <p>When travelling, what is the lowest cleanliness rating you're willing to accept?</p>
                        <p>Select the value below</p>
                        <Slider
                            sx={{ color: 'black' }}
                            getAriaLabel={() => 'Cleanliness value'}
                            value={cleanlinessValue}
                            onChange={handleCleanlinessChange}
                            valueLabelDisplay="auto"
                            min={2}
                            max={10}
                            valueLabelFormat={value => `${value}`}
                        />
                        <p>Lowest Cleanliness: {cleanlinessValue}</p>
                        <p>How important is cleanliness to you?</p>
                        <FormControl sx={{ width: '20%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Value
                            </InputLabel>
                            <Select
                                value={importance.cleanliness}
                                label="Select Value"
                                onChange={(event) => {
                                    setImportance({...importance, cleanliness: event.target.value})
                                }}
                                inputProps={{}}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
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
                </Slide>
            );
        case 5:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Visualization for Cleanliness</p>
                    </div>
                </Slide>
            )
        case 6:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
                        <p className='text-2xl font-bold'>Distance from City</p>
                        <p>The proximity to the actual city in Europe can affect your travel experience and convenience.</p>
                        <p>The average distance from cities for Airbnb listings in Europe is about 3.19 kilometers.</p>
                        <p>When traveling, how close or far from the city would you prefer to stay?</p>
                        <p>Select the distance range that best suits your travel needs below</p>
                        <Slider
                            sx={{ color: 'black' }}
                            getAriaLabel={() => 'Distance range'}
                            value={distanceRange}
                            onChange={handleDistanceChange}
                            valueLabelDisplay="auto"
                            min={0.02}
                            max={25.28}
                            valueLabelFormat={value => `${value} km`}
                        />
                        <p>Minimum Distance: {distanceRange[0]} km</p>
                        <p>Maximum Distance: {distanceRange[1]} km</p>
                        <p>How important is distance to city to you?</p>
                        <FormControl sx={{ width: '20%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Value
                            </InputLabel>
                            <Select
                                value={importance.distance}
                                label="Select Value"
                                onChange={(event) => {
                                    setImportance({...importance, distance: event.target.value})
                                }}
                                inputProps={{}}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
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
                </Slide>
            );
        case 7:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Visualization for Distance</p>
                    </div>
                </Slide>
            )
        case 8:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
                        <p className='text-2xl font-bold'>Room Type</p>
                        <p>Airbnb offers a variety of accommodation types in Europe to suit different travel preferences and group sizes.</p>
                        <p>The most common room types booked in Europe are private rooms and entire apartments/houses.</p>
                        <p>When traveling, what type of accommodation would you prefer?</p>
                        <p>Select the room type that best fits your needs below</p>
                        <FormControl sx={{ width: '40%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Room Type
                            </InputLabel>
                            <Select
                                value={roomType}
                                label="Select Room Type"
                                onChange={(event) => setRoomType(event.target.value)}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                }}
                            >
                                <MenuItem value="entire_place">Entire Place</MenuItem>
                                <MenuItem value="private_room">Private Room</MenuItem>
                            </Select>
                        </FormControl>
                        <p>How important is room type to you?</p>
                        <FormControl sx={{ width: '20%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Value
                            </InputLabel>
                            <Select
                                value={importance.roomType}
                                label="Select Value"
                                onChange={(event) => {
                                    setImportance({...importance, roomType: event.target.value})
                                }}
                                inputProps={{}}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
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
                </Slide>
            );
        case 9:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Visualization for Room Type</p>
                    </div>
                </Slide>
            )
        case 10:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
                        <p className='text-2xl font-bold'>Superhost Status</p>
                        <p>Airbnb's Superhost program recognizes hosts who provide exceptional hospitality and customer service.</p>
                        <p>Approximately 30% of Airbnb listings in Europe are hosted by Superhosts.</p>
                        <p>Would you like to stay with a Superhost for a more guaranteed quality experience?</p>
                        <p>Select your preference below</p>
                        <FormControl sx={{ width: '40%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Preference
                            </InputLabel>
                            <Select
                                value={superhostPreference}
                                label="Select Preference"
                                onChange={(event) => setSuperhostPreference(event.target.value)}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                }}
                            >
                                <MenuItem value="superhost_only">Yes, only show Superhost listings</MenuItem>
                                <MenuItem value="all_listings">No, include all listings</MenuItem>
                            </Select>
                        </FormControl>
                        <p>How important is Superhost status to you?</p>
                        <FormControl sx={{ width: '20%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Value
                            </InputLabel>
                            <Select
                                value={importance.superhost}
                                label="Select Value"
                                onChange={(event) => {
                                    setImportance({...importance, superhost: event.target.value})
                                }}
                                inputProps={{}}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
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
                </Slide>
            );
        case 11:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Visualization for Superhost</p>
                    </div>
                </Slide>
            )
        case 12:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
                        <p className='text-2xl font-bold'>Person Capacity</p>
                        <p>Airbnb accommodations in Europe cater to a wide range of group sizes, from solo travelers to large families or groups of friends.</p>
                        <p>The average person capacity for Airbnb listings in Europe is 4 people.</p>
                        <p>How many people will be traveling with you? Use the slider below to set your preferred range.</p>
                        <p>Adjust the slider to your group size</p>
                        <Slider
                            sx={{ color: 'black' }}
                            getAriaLabel={() => 'Person capacity range'}
                            value={personCapacity}
                            onChange={handlePersonCapacityChange}
                            valueLabelDisplay="auto"
                            min={1}
                            max={6}
                            valueLabelFormat={value => `${value} people`}
                        />
                        <p>Minimum Capacity: {personCapacity[0]} people</p>
                        <p>Maximum Capacity: {personCapacity[1]} people</p>
                        <p>How important is person capacity to you?</p>
                        <FormControl sx={{ width: '20%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Value
                            </InputLabel>
                            <Select
                                value={importance.capacity}
                                label="Select Value"
                                onChange={(event) => {
                                    setImportance({...importance, capacity: event.target.value})
                                }}
                                inputProps={{}}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
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
                </Slide>
            );
        case 13:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Visualization for Person Capacity</p>
                    </div>
                </Slide>
            )
        case 14:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px] gap-[20px]'>
                        <p className='text-2xl font-bold'>Guest Satisfaction Score</p>
                        <p>Airbnb collects feedback from guests to rate their overall satisfaction with a listing, taking into account factors such as cleanliness, accuracy, and communication.</p>
                        <p>The average guest satisfaction score for Airbnb listings in Europe is 92.63.</p>
                        <p>What is the minimum guest satisfaction score you would accept?</p>
                        <p>Use the slider below to set your preferred range.</p>
                        <Slider
                            sx={{ color: 'black' }}
                            getAriaLabel={() => 'Satisfaction score range'}
                            value={satisfactionScore}
                            onChange={handleSatisfactionChange}
                            valueLabelDisplay="auto"
                            min={0}
                            max={100}
                            valueLabelFormat={value => `${value}%`}
                        />
                        <p>Minimum Score: {satisfactionScore}%</p>
                        <p>How important is guest satisfaction score to you?</p>
                        <FormControl sx={{ width: '20%' }}>
                            <InputLabel
                                sx={{
                                    '&.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            >
                                Select Value
                            </InputLabel>
                            <Select
                                value={importance.satisfaction}
                                label="Select Value"
                                onChange={(event) => {
                                    setImportance({...importance, satisfaction: event.target.value})
                                }}
                                inputProps={{}}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'black',
                                    },
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
                </Slide>
            );
        case 15:
            return (
                <Slide prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <p className='text-2xl font-bold'>Visualization for Guest Satisfaction Score</p>
                    </div>
                </Slide>
            )
        case 16:
            return (
                <Slide end prev={prevSlide} next={nextSlide}>
                    <div className='flex flex-col items-center h-full w-full p-[30px]'>
                        <Link 
                            href={{
                                pathname: '/results',
                                query: {
                                    weekday: JSON.stringify(weekday),

                                    priceRange: JSON.stringify(priceRange),
                                    distanceRange: JSON.stringify(distanceRange),
                                    personCapacity: JSON.stringify(personCapacity),

                                    cleanlinessValue: String(cleanlinessValue),
                                    satisfactionScore: String(satisfactionScore),

                                    superhostPreference: superhostPreference || '',

                                    importance: JSON.stringify(importance), 
                                }
                            }}
                        >
                            <button className='cursor-pointer w-[200px] h-[100px] shadow bg-black text-white'>City Matches</button>
                        </Link>
                    </div>
                </Slide>
            )
    }
}

export default SlideDeck