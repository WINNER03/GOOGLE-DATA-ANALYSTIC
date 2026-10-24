# NYC Flight Delay Analysis — Python + Google Colab

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/WINNER03/GOOGLE-DATA-ANALYSTIC/blob/main/projects/nyc-flight-delay-analysis/nyc_flight_delay_analysis.ipynb)

An aviation-themed data analytics portfolio project exploring **which months, NYC departure airports, airlines, hours, and routes had higher late-arrival rates**.

## Run it

1. Click the **Open in Colab** badge above.
2. In Colab, choose **Runtime → Run all**.
3. Inspect charts and insights directly in the notebook.
4. Optionally download output PNG charts and CSV tables from the Colab **Files** sidebar.

No local setup or manual dataset upload is required. Google Colab needs an internet connection to load the CSV.

## Dataset

- Provider: [OpenIntro — Flights data](https://www.openintro.org/data/index.php?data=nycflights).
- Original source: Wickham (2014), `nycflights13`.
- Coverage: random sample of **32,735 departing flights from JFK, LGA, and EWR in 2013**.
- CSV: https://www.openintro.org/data/csv/nycflights.csv

## Key analytical questions

- What fraction of flights with recorded arrival delays landed **more than 15 minutes late**?
- How does that fraction vary by month and departure airport?
- Which airline codes appear to have higher delay rates in this sample?
- How does the hour field relate to late arrivals?
- Which routes are busiest, and how strongly are departure and arrival delays associated?

## Methods

- Python, Pandas, NumPy, Matplotlib, Seaborn
- Data validation, missing-value audit, explicit denominator selection
- Reusable group-by metrics and visualizations
- Export of charts and aggregated CSV summary tables

**Definitions and limitations:** The late-arrival threshold is strictly greater than 15 minutes. Only flights with a known arrival-delay value are included in late-rate denominators. Missing delay data does not necessarily mean canceled. These are descriptive statistics from 2013; they are not current flight reliability ratings and cannot establish causality.

## Files

- `nyc_flight_delay_analysis.ipynb` — self-contained runnable Colab notebook.
- `data_dictionary.md` — metric definitions and scope.
- `requirements.txt` — Python libraries (mainly for local use).

## Local use

Install the dependencies in `requirements.txt`, open the notebook in Jupyter, and run its cells in order.

## Credits

Dataset credit: OpenIntro and Wickham, H. (2014), *nycflights13: Data about flights departing NYC in 2013*.
