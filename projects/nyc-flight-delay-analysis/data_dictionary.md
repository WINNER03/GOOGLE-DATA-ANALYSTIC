# Data dictionary / methods

Source: https://www.openintro.org/data/index.php?data=nycflights

- `year`, `month`, `day`: date of departure.
- `origin`: NYC departure airport (JFK, LGA, EWR).
- `dest`: destination airport code.
- `carrier`: two-character airline identifier.
- `dep_delay`: departure delay in minutes (negative values represent early departures).
- `arr_delay`: arrival delay in minutes (negative values represent early arrivals).
- `hour`: hour field provided by the source dataset; analyzed as recorded.
- `route`: derived `origin → dest`.
- `late_15`: `arr_delay > 15` on records with non-missing `arr_delay`.
- `late_rate_pct`: 100 × late arrivals / arrivals with observed arrival delay.
- `mean_arr_delay_min`: average of observed arrival delays, including negative values.

Records with missing arrival delay are excluded from late-rate denominators and **not assumed to be cancellations**.

Carrier chart requires at least 100 observed arrivals per carrier; route table requires 30. These thresholds reduce extremely small groups, but do not make comparisons causal.

Historical 2013 sample only; do not generalize to current airlines or national operations.
