# Happy-Travels: European Airbnb Data Visualization

Team 20 - Abhimanyu Warrier, Hussain Ali, Raymond Wong, Rani Saro, Mohnish Gopi

## Description

Happy-Travels is a [Next.js](https://nextjs.org) web application designed to empower novice travelers in making informed Airbnb choices across Europe. It challenges the common assumption that “higher price = better stay” by highlighting how numerous factors—such as cleanliness, host status, room type, and location—collectively shape the true travel experience. Our goal is to equip users with an evidence-based way to weigh what truly matters to them. The project focuses on providing insightful data summaries through interactive maps and dynamic charts powered by [D3.js](https://d3js.org/).

The project employs a "Martini-Glass" narrative structure: it begins with an author-driven, guided experience where users define their preferences for key Airbnb parameters, and then transitions into a user-driven, free exploration phase. Through a series of interactive slides, users set their priorities for factors like price, cleanliness, and guest satisfaction, viewing relevant D3.js-powered visualizations (e.g., histograms, lollipop charts, circular gauges, bar charts, cumulative line charts, dot plots, stacked bar charts) along the way. This culminates in a personalized "Top 3 Cities" recommendation based on a transparent scoring algorithm. Following this, users can freely explore a comprehensive map of Europe, diving into detailed statistics for various cities, including room type distributions, superhost percentages, and other insightful metrics displayed in the side panel using D3.js components like donut charts and Sankey diagrams. The application utilizes a cleaned version of the "Airbnb Prices in European Cities" dataset from Kaggle.

The repository follows a conventional Next.js app format keeping all its main code in the src directory. Inside src, the app/ folder is key for Next.js; it holds our pages (like the map and slideshows), shared layouts, and the API routes used for things like fetching city data.

Next to app/, there's a components/ folder. This is where all the D3 charts (Sankey, Donut, Bar, etc.) and other React components (map stuff, sliders, panels) live, each usually in its own subfolder to keep things tidy. The CSV files from Kaggle with the Airbnb data are in src/data/. Finally, the src/utils/ folder has helper functions and extra data for our city recommendation algorithm. For styling, we're using a mix of Tailwind CSS and regular inline CSS.

## Installation

To set up the Happy-Travels project locally, follow these steps:

1.  **Clone the repository** (if applicable):
    ```bash
    git clone git@github.com:avwarrier/Happy-Travels.git
    cd happy-travels
    ```

2.  **Install dependencies**:
    This project uses npm, yarn, pnpm, or bun for package management. Choose your preferred package manager.
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```
    Ensure `d3` and `d3-sankey` are installed for the visualizations:
    ```bash
    npm install d3 d3-sankey
    # or
    yarn add d3 d3-sankey
    ```

3.  **Set up API (if applicable)**:
    The application fetches Airbnb data via an API route (e.g., `/api/airbnb-data/[cityId]`). Ensure any backend services or data sources required by this API are correctly configured.

## Execution

To run a demo of the Happy-Travels application on your local machine make sure you are in the Happy-Travels directory and have all packages installed. Then run the following command in the terminal:

1.  **Start the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

2.  **Open in browser**:
    Once the server is running, open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

3.  **Interact with the Application**:
    * **Guided Slideshow (Author-Driven Phase)**:
        * Begin with a welcome page introducing the interactive data story and its objectives.
        * Navigate through a vertical slideshow focusing on key Airbnb parameters: Price, Cleanliness, Distance from Metro Station/City Center, Guest Satisfaction, and Person Capacity.
        * For each parameter, use interactive sliders to select your preferred range (e.g., low to high) or a specific value.
        * Assign an importance level (e.g., very important, somewhat important, not important) to each factor, which will influence the final city recommendation.
        * Observe D3.js visualizations tailored to each parameter (e.g., a full-range histogram and a lollipop chart for Price; a circular gauge and a bar chart for Cleanliness; a cumulative line chart and a dot plot for Distance; a stacked bar chart for Guest Satisfaction; a histogram for Person Capacity) that illustrate trends and comparisons across European cities.
        * At the end of the guided tour, receive a "Top 3 Cities" recommendation. This is calculated by an algorithm that scores each city against your chosen preferences and their assigned importance, displayed using a podium-style chart and a horizontal bar chart for scoring breakdown.
    * **Exploratory Map (User-Driven Phase)**:
        * After the guided slideshow, transition to an interactive Leaflet map of Europe displaying city markers.
        * Click on any city marker to load and display its detailed Airbnb statistics in a dynamically updating side panel.
        * Explore various D3.js visualizations within this side panel:
            * Bar charts showing weekday versus weekend listing volumes.
            * Donut charts illustrating the distribution of room types (e.g., Entire home/apt, Private room).
            * Sankey diagrams visualizing data flows, such as the relationship between room types and superhost status.
            * Gauge charts displaying average metrics like cleanliness ratings or guest satisfaction percentages.
        * Interact with elements within these charts, such as clicking on links in the Sankey diagram, to view specific data details in a designated area below the chart.
        * Freely explore the comprehensive dataset, compare cities based on various parameters (some not included in the initial quiz, like superhost percentages), and potentially refine your travel preferences or plans. This phase allows for self-directed discovery, completing the Martini-Glass experience.

