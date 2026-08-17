---
sidebar_position: 5
tags:
  - similarity
  - weather
  - archive
  - rp5.ru
---

# Weather Observations Similarity

The `Clematis Weather API` backend can now also answer the question: **How alike were two moments of weather?**
The primary use case is picking an archive photograph that looks like a requested day, since not all the days
have photos of that day reflecting weather. 

An [`Observation`](../model/Observation.java) entity from the rp5.ru archive for the day in question is reduced to a small vector of
comparable features, each pair of features is scored on a `0..1` scale, and the scores are combined
into a single weighted distance. A vantage-point tree is layered on top so that the nearest
observations out of a large archive can be found without scanning everything.


## Package Contents

The sources can be found in the 
[tools/parser/src/main/java/jworkspace/weather/similarity](https://github.com/grauds/clematis.weather.api/tree/main/tools/parser/src/main/java/jworkspace/weather/similarity)
directory.

| Class | Kind | Role                                                                                   |
|---|---|----------------------------------------------------------------------------------------|
| ObservationFeatures | `record` | The comparable shape of an observation — free-text fields already parsed into numbers. |
| SimilarityFeature | `enum` | The 13 comparable aspects, each with its own normalisation rule and scale.             |
| SimilarityWeights | `record` | How much each feature counts. Ships with `PHOTO` and `BALANCED` profiles.              |
| ObservationSimilarityCalculator) | utility | Combines per-feature differences into one distance in `0..1`.                          |
| ObservationVPTree | class | Metric-space index for k-nearest-neighbour search over that distance.                  |
| WeatherPhenomenon | `record` | Classifies the free-prose `WW` field onto independent axes and scores them.            |
| CloudAmount | utility | Parses the `N` / `Nh` cloud-cover prose into a sky fraction.                           |
| WindDirections | utility | Places `WindDirection` on the compass rose as a bearing in degrees.                    |

Everything in the package is deliberately null-tolerant: the archive is full of gaps (snow depth and
soil temperature are only reported at some hours, whole fields are empty for the earlier years),
and a gap must not be read as a zero.

## The Processing Pipeline At A Glance

The data preparation process happens on the server startup, the similarity is then stored in the dedicated 
table to serve the requests.
```
Observation (JPA entity, raw archive fields)
        │
        │  CloudAmount.fraction( N )          "70 – 80%."   → 0.75
        │  WindDirections.degrees( dd )       NORTH_WEST    → 315.0
        │  WeatherPhenomenon.of( WW )         "Rain, slight…" → (RAIN, NONE, SLIGHT, false, false)
        │  t − td, key.date → dayOfYear/hourOfDay
        ▼
ObservationFeatures  (13 nullable fields)
        │
        │  SimilarityFeature.difference(a, b)   → 0..1 per feature, or null when either side is missing
        ▼
ObservationSimilarityCalculator.between(a, b, weights)
        │
        │  Σ (dᵢ · wᵢ) / Σ wᵢ   over features that produced a value
        ▼
Double distance in 0..1     (0 = identical, 1 = as different as it gets)
        │
        ▼
ObservationVPTree.findNearest(target, k, maxDistance)   → k closest observations
```

## The Distance Calculation 

For two observations *A* and *B* and a weight profile *w*:

```
                Σ  wᵢ · dᵢ(A, B)
                i ∈ K
  D(A, B)  =  ────────────────────
                Σ  wᵢ
                i ∈ K

  K = { features i : wᵢ > 0  and  dᵢ(A, B) ≠ null }
```

Three properties fall out of this:

* **Bounded.** Every `dᵢ ∈ [0, 1]`, so `D ∈ [0, 1]`.
* **Gap-tolerant.** Missing features are excluded from both the numerator and the denominator.
  Two observations that only share temperature and cloud cover are still comparable — they are just
  compared on less evidence.
* **Undefined, not zero, when nothing overlaps.** If `K` is empty, `between` returns `null` rather
  than `0.0`. Callers must handle that; for example, `ObservationVPTree` maps it to `Double.MAX_VALUE`.

### Per-Feature Normalisation

Each feature converts a difference in real units into `0..1` using a **scale constant** — the gap at
which the feature is considered fully different. Beyond the scale the value is clamped, so a single
extreme outlier is not considered.

Three rules are used, depending on the feature's unit:

**Linear** — `clamp(|a − b| / scale)`

Plain absolute difference. Used where a degree is a degree wherever you are on the axis.

**Compressed** — `clamp(|√a − √b| / √scale)`

Square-root scale, so steps away from zero weigh more than steps taken further out. Dry against
barely-wet, or bare ground against a first covering of snow is the interesting step; heavy against
heavier is not.

**Circular** — `clamp(min(δ, period − δ) / scale)` where `δ = |a − b| mod period`

Compares two points on a cycle the short way round: 350° and 10° are 20° apart, not 340°, and
31 December sits next to 1 January.

### The Feature Table

| Feature | Source field(s) | Unit | Rule | Scale | Reading of the scale |
|---|-----------------|---|---|---|---|
| `TEMPERATURE` | `T`             | °C | linear | 12.0 | 12 °C apart is a different kind of day |
| `DEW_POINT_SPREAD` | `T − Td`        | °C | linear | 6.0 | how far the air is from saturation — haze, softness of the light |
| `HUMIDITY` | `U`             | % | linear | 25.0 | |
| `PRESSURE` | `P`             | mmHg | linear | 12.0 | |
| `CLOUD_COVER` | `N`             | fraction `0..1` | linear | 0.5 | half the sky is a full difference |
| `WIND_SPEED` | `Ff`            | m/s | linear | 4.0 | |
| `WIND_BEARING` | `DD`            | degrees | circular (360) | 90.0 | a quarter turn is a full difference |
| `VISIBILITY` | `VV`            | km | compressed | 10.0 | fog vs light haze matters far more than clear vs very clear |
| `PRECIPITATION` | `RRR`           | mm | compressed | 5.0 | |
| `SNOW_DEPTH` | `sss`           | cm | compressed | 15.0 | |
| `PHENOMENON` | `WW`            | — | `WeatherPhenomenon.distance` | — | see below |
| `DAY_OF_YEAR` | `key.date`      | days | circular (366) | 30.0 | a month apart is a different season |
| `HOUR_OF_DAY` | `key.date`      | hours | circular (24) | 3.0 | three hours changes the light completely |


## Weight Profiles

`SimilarityWeights` is a `Map<SimilarityFeature, Double>`. A weight of `0` (or an absent key) drops
the feature entirely — the calculator skips it before it is even evaluated. Weights need not sum to
anything in particular, because the denominator is whatever weight was actually used.

### `SimilarityWeights.PHOTO`

Tuned for picking a photograph that looks like the requested day.

| Feature | Weight | Share of total |
|---|---:|---:|
| `DAY_OF_YEAR` | 3.0 | 17.1 % |
| `SNOW_DEPTH` | 2.5 | 14.3 % |
| `CLOUD_COVER` | 2.5 | 14.3 % |
| `PHENOMENON` | 2.0 | 11.4 % |
| `HOUR_OF_DAY` | 2.0 | 11.4 % |
| `TEMPERATURE` | 1.5 | 8.6 % |
| `VISIBILITY` | 1.0 | 5.7 % |
| `DEW_POINT_SPREAD` | 0.8 | 4.6 % |
| `PRECIPITATION` | 0.8 | 4.6 % |
| `WIND_SPEED` | 0.5 | 2.9 % |
| `HUMIDITY` | 0.5 | 2.9 % |
| `PRESSURE` | 0.2 | 1.1 % |
| `WIND_BEARING` | 0.2 | 1.1 % |
| **Total** | **17.5** | |

:::info
Season and time of day dominate: they set the sun height, the length of the shadows, and whether there
are leaves on the trees. A mild overcast morning in April and one in October are the same weather but
nothing like the same picture. Snow on the ground, cloud cover, and what was falling out of the sky
come next. Humidity and wind bearing are nearly invisible in a photograph and are kept only as
tiebreakers.
:::

### `SimilarityWeights.BALANCED`

Every feature at `1.0`. Use this to compare weather *as weather*, without the bias towards what a
camera would have seen.

### A Custom Profile

Use the following code snipped to create a custom profile:
```java
SimilarityWeights thermal = new SimilarityWeights(Map.of(
    SimilarityFeature.TEMPERATURE,      3.0,
    SimilarityFeature.HUMIDITY,         1.0,
    SimilarityFeature.DEW_POINT_SPREAD, 1.0
));
// every other feature defaults to 0.0 via weightOf() and is skipped
```

## Parsing The Free-Text Fields

The rp5.ru archive stores several fields as English prose rather than codes. Three helpers turn that
prose into numbers.

### `CloudAmount` — The `N` And `Nh` Fields

The vocabulary is shared by total cloud cover (`N`) and low cloud amount (`Nh`). Rather than
listing the exact strings — which vary in spacing and use two different dash characters — any
value carrying digits is resolved by averaging every percentage found in the text, then clamping
to `1.0`.

| Raw value                                                    | Result | Why |
|--------------------------------------------------------------|---|---|
| `no clouds`                                                  | `0.0` | matched by name (`CLEAR`) |
| `10%  or less, but not 0`                                    | `0.05` | mean of 10 and 0 |
| `20 – 30%`                                                   | `0.25` | mean of the range |
| `70 – 80%`                                                   | `0.75` | spacing and en-dash are irrelevant to the regex |
| `90  or more, but not 100%`                                  | `0.95` | mean of 90 and 100 |
| `100%`                                                       | `1.0` | |
| `Sky obscured by fog and/or other meteorological phenomena.` | `1.0` | matched by name (`OVERCAST`) |
| `null` / blank / no digits                                   | `null` | unknown, and the feature is skipped |

`CloudAmount.isObscured(text)` distinguishes the last-but-one case: the sky is hidden by fog rather
than by cloud. Visually, that is nothing like an overcast sky, even though both cover the whole sky.
The method is available for callers that care; `fraction` itself collapses both to `1.0`, and the
visibility and phenomenon features are what actually separate them in the score.

### `WeatherPhenomenon` — The `WW` Field

`WW` is free prose describing what the observer saw, e.g. `"Continuous fall of snowflakes, slight at
time of observation. "` or `"Shower(s) of hail, or of rain and hail. "`. There are a couple of hundreds of
distinct phrases in the archive, so rather than maintaining a square distance matrix over them, the
prose is classified onto five independent axes:

| Axis | Type | Values |
|---|---|---|
| `precipitation` | enum | `NONE, DRIZZLE, RAIN, RAIN_AND_SNOW, SNOW, HAIL` — ordered liquid → solid, so neighbouring constants describe visually similar weather |
| `obscuration` | enum | `NONE, HAZE, MIST, FOG` — ordered by how much visibility was lost |
| `intensity` | enum | `UNKNOWN, SLIGHT, MODERATE, HEAVY` |
| `thunderstorm` | boolean | `"thunderstorm"` or `"lightning"` present |
| `shower` | boolean | `"shower"` present |

Two normalizations run before classification:

* A trailing measurement clause (`"Diameter of glaze deposit is 3 mm."`, `"Maximum diameter of
  hailstones is 3 mm."`) is truncated — it describes a deposit, not the weather, and the stray
  "hailstones" would otherwise be read as a hail report.
* `"(with or without fog)"` is removed — `"snow grains (with or without fog)"` is not a fog report.

`distance` combines the axes with fixed shares:

```
  0.50 · precipitation  +  0.25 · obscuration  +  0.15 · intensity  +  0.07 · thunderstorm + 0.03 · shower
```

Within the ordered enums the distance is `|ordinal(a) − ordinal(b)| / span`, with two special cases:

* **Precipitation `NONE` against anything** is `1.0`, not a small ordinal step — dry weather against
  any precipitation is as different as that axis gets.
* **Intensity `UNKNOWN` on either side** yields `null`, and its 0.15 share is redistributed by
  dividing the remaining total by `0.85`. Plenty of reports name no intensity at all, and `UNKNOWN`
  keeps that distinct from a genuinely slight one.

### `WindDirections` — The `DD` Field

The sixteen points of the compass are mapped to bearings at 22.5° intervals (`NORTH` → 0.0,
`NORTH_NORTHEAST` → 22.5, … `NORTH_NORTHWEST` → 337.5). Everything else returns `null`:

* `NO_WIND` and `VARIABLE_WIND` have no angle by definition;
* the four values naming two opposing quadrants at once — `EAST_NORTHWEST`, `EAST_SOUTHWEST`,
  `WEST_NORTHEAST`, `WEST_SOUTHEAST` — are not points of the compass and are treated as "direction
  not comparable" rather than guessed at.

A `null` bearing simply drops `WIND_BEARING` from that comparison.

## Nearest-Neighbour Search: `ObservationVPTree`

Scoring every archive record against a target is `O(n)` per query. A 
[vantage-point tree](https://en.wikipedia.org/wiki/Vantage-point_tree) indexes the
observations in the metric space defined by the distance above, so a query touches far fewer of them.

### Construction

```java
ObservationVPTree tree = new ObservationVPTree(observations);
```

At each node the builder:

1. picks a random observation as the vantage point;
2. measures the distance from it to every remaining observation;
3. takes the median of those distances as the node's `radius`;
4. sends everything at `distance ≤ radius` to the left subtree and the rest to the right;
5. recurses.

The median split keeps the tree balanced, giving `O(log n)` expected depth over `n` observations. An
empty or `null` input produces an empty tree whose queries return an empty list.

### Query

```java
List<Observation> similar = tree.findNearest(target, 10, 0.35);
```

A bounded max-heap of size `k` holds the best candidates found so far. At each node the target's
distance to the vantage point is measured, and the candidate is admitted if it beats the current worst
(and is within `maxDistance`). The search radius `bound` is `maxDistance` while the heap is not
yet full, and the heap's worst distance once it is — so it tightens as better candidates arrive.

Subtrees are then visited only if they can still contain something closer than `bound`:

```
  visit left   if   dist − bound ≤ radius        (the inner ball may reach the query ball)
  visit right  if   dist + bound ≥ radius        (the outer shell may reach the query ball)
```

The nearer side is visited first, so `bound` tightens as early as possible and the other side is
often pruned outright. Results are drained from the max-heap and prepended, so the returned list runs
from most similar to least similar.

:::info
* **The distance is not a strict metric.** Clamping and the missing-feature renormalisation mean the
  triangle inequality does not hold in general — two observations with disjoint gaps can be scored on
  entirely different feature sets. VP-tree pruning assumes a metric, so results are best treated as a
  high-quality approximation rather than a guaranteed exact k-NN. For a small candidate set, or when
  exactness matters, call `ObservationSimilarityCalculator.between` directly over the candidates.
* **The weight profile is fixed to `PHOTO`.** `getDistance` hardcodes it, and the tree's geometry
  depends on it — an index built for one profile cannot be reused for another.
* **Incomparable pairs cost pruning power.** When `between` returns `null` (no overlapping features),
  the tree substitutes `Double.MAX_VALUE`. That is correct in the sense of "as far as possible", but
  such rows skew the median split and end up in the far subtree.
* **The tree is not deterministic.** The vantage point is drawn from an unseeded static `Random`, so
  two trees built from the same input differ in shape. The best matches are stable; tie-breaking
  order and pruning efficiency are not.
* **The tree is immutable and not synchronised for writes.** It is built once from a snapshot; there
  is no insert or delete. Concurrent `findNearest` calls on a fully built tree are safe, since search
  mutates nothing but its own local heap.
* **Rebuild cost.** Construction is `O(n log n)` distance evaluations, each of which parses 
  the free-text fields of both operands. For large archives, build once and keep it.
:::

## Worked Example

Two spring observations, scored with `PHOTO`:

| | A — 12 Apr 2021, 09:00 | B — 20 Apr 2021, 12:00 |
|---|---|---|
| `T` / `Td` | 8.0 / 2.0 °C | 11.0 / 1.0 °C |
| `U` | 65 % | 50 % |
| `P` | 751 mmHg | 755 mmHg |
| `N` | `70 – 80%` | `100%` |
| `Ff` / `DD` | 3 m/s / `NORTH_WEST` | 5 m/s / `WEST` |
| `VV` | 10.0 km | 4.0 km |
| `RRR` | 0.0 mm | 1.0 mm |
| `sss` | *(not reported)* | *(not reported)* |
| `WW` | *(blank)* | `Rain, slight at time of observation.` |

| Feature | dᵢ | working | wᵢ | wᵢ·dᵢ |
|---|---:|---|---:|---:|
| `DAY_OF_YEAR` | 0.267 | `min(8, 358) / 30` | 3.0 | 0.800 |
| `SNOW_DEPTH` | *null* | missing on both sides — **skipped** | — | — |
| `CLOUD_COVER` | 0.500 | `|0.75 − 1.00| / 0.5` | 2.5 | 1.250 |
| `PHENOMENON` | 0.588 | `(0.50·1 + 0.25·0 + 0.10·0) / 0.85` | 2.0 | 1.176 |
| `HOUR_OF_DAY` | 1.000 | `min(3, 21) / 3` | 2.0 | 2.000 |
| `TEMPERATURE` | 0.250 | `3 / 12` | 1.5 | 0.375 |
| `VISIBILITY` | 0.368 | `|√10 − √4| / √10` | 1.0 | 0.368 |
| `DEW_POINT_SPREAD` | 0.667 | `|6 − 10| / 6` | 0.8 | 0.533 |
| `PRECIPITATION` | 0.447 | `|√0 − √1| / √5` | 0.8 | 0.358 |
| `WIND_SPEED` | 0.500 | `2 / 4` | 0.5 | 0.250 |
| `HUMIDITY` | 0.600 | `15 / 25` | 0.5 | 0.300 |
| `PRESSURE` | 0.333 | `4 / 12` | 0.2 | 0.067 |
| `WIND_BEARING` | 0.500 | `min(45, 315) / 90` | 0.2 | 0.100 |
| | | | **15.0** | **7.577** |

```
D(A, B) = 7.577 / 15.0 = 0.505
```

Note the denominator: `17.5 − 2.5 = 15.0`, because `SNOW_DEPTH` never produced a value. Note also
that `HOUR_OF_DAY` saturated — three hours is already a full difference on that axis, and at weight
2.0 it contributes more than a quarter of the raw total on its own. In a photograph-matching context
that is the intent: 09:00 light and 12:00 light are not interchangeable.

Interpreting the result: roughly `< 0.15` is "the same kind of moment", `0.15–0.35` is a plausible
substitute, and `> 0.5` — as here — is a visibly different day.

## Usage Examples

### Compare Two Observations

```java
Double distance = ObservationSimilarityCalculator.between(first, second, SimilarityWeights.PHOTO);
if (distance == null) {
    // no overlapping features — the two rows are not comparable at all
} else if (distance < 0.2) {
    // close enough to stand in for one another
}
```

### Find The Closest Archive Days

```java
ObservationVPTree tree = new ObservationVPTree(repository.findAll());

List<Observation> matches = tree.findNearest(target, 5, 0.3);   // at most 5, never worse than 0.3
```

### Inspect A Single Feature

```java
ObservationFeatures a = ObservationFeatures.of(first);
ObservationFeatures b = ObservationFeatures.of(second);

Double cloudDelta = SimilarityFeature.CLOUD_COVER.difference(a, b);   // null when either N is unparseable
```

:::tip
This is also the entry point for debugging a surprising score: walking
`SimilarityFeature.values()` and printing `difference` alongside `weights.weightOf(feature)` shows
exactly which axis dominated.
:::
