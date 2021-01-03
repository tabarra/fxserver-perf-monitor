<p align="center">
    <h1 align="center">
        FXServer Performance Monitor
    </h1>
    <h4 align="center">
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/"><img src="https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg" alt="License: CC BY-NC-SA 4.0"></img></a>
        &nbsp; 
        <a href="https://discord.gg/f3TsfvD"><img src="https://discordapp.com/api/guilds/577993482761928734/widget.png?style=shield"></img></a>
    </h4>
    <p align="center">
        <b>Collect and display (using D3.js) the performance of an FXServer.</b>
    </p>
</p>

## Foot Note... ish
I wrote some code to help me build the heatmap for [txAdmin](https://github.com/tabarra/txAdmin), but it ended up acceptable so why not share it?!  
I do not have the intention to update this repository... unless some people find it useful.  
Also I am fully aware that I could use Grafana for this, but it wouldn't work for txAdmin.  
   
Here's the grafana query:
```
histogram_quantile(0.95, sum(rate(tickTime_bucket[5m])) by (le))
```  
  
Here is an example of the data we are scraping (svMain only):
```c#
# HELP tickTime Time spent on server ticks
# TYPE tickTime histogram
tickTime_count{name="svMain"} 873550
tickTime_sum{name="svMain"} 242.026000
tickTime_bucket{name="svMain",le="0.005000"} 873534
tickTime_bucket{name="svMain",le="0.010000"} 873538
tickTime_bucket{name="svMain",le="0.025000"} 873547
tickTime_bucket{name="svMain",le="0.050000"} 873548
tickTime_bucket{name="svMain",le="0.075000"} 873548
tickTime_bucket{name="svMain",le="0.100000"} 873548
tickTime_bucket{name="svMain",le="0.250000"} 873549
tickTime_bucket{name="svMain",le="0.500000"} 873550
tickTime_bucket{name="svMain",le="0.750000"} 873550
tickTime_bucket{name="svMain",le="1.000000"} 873550
tickTime_bucket{name="svMain",le="2.500000"} 873550
tickTime_bucket{name="svMain",le="5.000000"} 873550
tickTime_bucket{name="svMain",le="7.500000"} 873550
tickTime_bucket{name="svMain",le="10.000000"} 873550
tickTime_bucket{name="svMain",le="+Inf"} 873550
```

References:
```
The one with the rows in groups
https://observablehq.com/@sjengle/zillow-affordability-heatmap

Vega library
https://observablehq.com/@andreaskdk/song-tempo-heatmap

Colors!
https://github.com/d3/d3-scale-chromatic/blob/v2.0.0/README.md#schemeCategory10
```
