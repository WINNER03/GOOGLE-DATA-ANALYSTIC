# FlightScope — NYC Flight Delay Dashboard

A responsive, **web-based aviation data analytics dashboard** built with HTML, CSS, JavaScript, and native SVG. No Google Colab or Python runtime needed to explore the website.

## Demo (GitHub Pages)

After GitHub Pages is enabled for this repository, the website should appear at:

**https://winner03.github.io/GOOGLE-DATA-ANALYSTIC/**

**GitHub Pages setup (one-time, repo owner):**

1. Open [repository Settings → Pages](https://github.com/WINNER03/GOOGLE-DATA-ANALYSTIC/settings/pages).
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select branch **main**, folder **/docs**, and click **Save**.
4. When Pages reports the site as published, open the URL above.

The project files are already committed under \`docs/\`. If Pages isn't enabled, GitHub stores the source but the public site URL isn't yet active.

## Features

- Dataset of **32,735 flights** that departed JFK, LGA and EWR in 2013.
- Filter every chart by **origin airport, month, airline code and route search**.
- KPI cards: flight count, percentage more than 15 minutes late, mean and median arrival delay.
- Dynamic trends by month, origin, airline and departure hour.
- Top 8 routes by sample volume and a flight-record explorer.
- Export the filtered records as **CSV**.
- Responsive layout that works on phones and desktop browsers.
- **Self-hosted dataset**: no OpenIntro API or runtime CSV download is required.
- No frameworks, package installations, tracking, secrets or authentication.

## Structure

\`\`\`text
docs/
├── index.html         # Site markup
├── styles.css         # Mobile-friendly presentation
├── app.js             # Filters, aggregations, SVG charts and CSV export
├── data/
│   └── flights.js     # Locally stored 2013 flight sample
└── README.md          # This guide
\`\`\`

The companion [Google Colab notebook](../projects/nyc-flight-delay-analysis/nyc_flight_delay_analysis.ipynb) remains available for Python analysis.

## Data and definitions

Source: [OpenIntro nycflights documentation](https://openintrostat.github.io/openintro/reference/nycflights.html); dataset CSV obtained from [Rdatasets](https://github.com/vincentarelbundock/Rdatasets/blob/master/csv/openintro/nycflights.csv). Original credit: Wickham, H. (2014), *nycflights13*.

The embedded data rows contain:
\`[month, day, origin, dest, carrier, departure_delay_minutes, arrival_delay_minutes, hour, distance_miles]\`.

- Late arrival means **strictly greater than 15 minutes** after scheduled arrival.
- Late-arrival percentages use **only records with observed arrival delay**.
- Negative delay values mean early arrival/departure.
- Charts and statistics are descriptive, using a **2013 sample**; they are not current operational metrics, forecasts, or causally adjusted comparisons.
- The carrier comparison shows only carriers with **at least 100 observed arrivals** in the currently filtered subset.

## Run locally

Download the \`docs/\` folder and open \`index.html\` in a browser. Data is stored in a local JavaScript file and charts use inline SVG, so no local server is necessary.

## Credits

Designed as an aviation data-analysis portfolio exercise. Source acknowledgments are displayed on the website.
