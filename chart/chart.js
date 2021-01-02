const translate = (x, y) => {
    return `translate(${x}, ${y})`;
};

//FIXME: remove this
const yLabels = ['0.005', '0.010', '0.025', '0.050', '0.075', '0.100', '0.250', '0.500', '0.750', '1.000', '2.500', '5.000', '7.500', '10.000', '+Inf']
// const yLabels = ['5 μs', '10 μs', '25 μs', '50 μs', '75 μs', '0.1 ms', '0.25 ms', '0.5 ms', '0.75 ms', '1 ms', '2.5 ms', '5 ms', '7.5 ms', '10 ms', '+Inf'];


const drawHeatmap = (d3Container, perfData) => {
    const color = d3.scaleSequential(d3.interpolateInferno)
        .domain([0, 1])

    // console.log(perfData[0])
    // console.log(perfData[1])
    // console.log(perfData[2])


    //Flatten data
    const snapTimes = [];
    const snapAvgTickTimes = [];
    const snapClients = [];
    const snapBuckets = [];
    for (let snapIndex = 0; snapIndex < perfData.length; snapIndex++) {
        const snap = perfData[snapIndex];
        snapTimes.push(snap.ts);
        snapAvgTickTimes.push(snap.avgTime);
        snapClients.push(snap.clients);
        for (let bucketIndex = 0; bucketIndex < 15; bucketIndex++) {
            const freq = (typeof snap.buckets[bucketIndex] == 'number')? snap.buckets[bucketIndex] : 0
            snapBuckets.push({
                x: snapIndex,
                y: bucketIndex,
                freq
            })
        }
    }
    console.log(snapBuckets)


    const width = d3Container.offsetWidth;
    const height = 340;
    const margin = { top: 0, right: 0, bottom: 20, left: 60 };
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    const x = d3.scaleBand()
        .domain(d3.range(snapTimes.length))
        .range([margin.left, width - margin.right])
    const xAxis = d3.axisBottom(x)
        .tickFormat((d, i) => {
            const time = new Date(snapTimes[i]);
            return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
        })
    svg.append('g')
        .attr("transform", translate(0, height - margin.bottom))
        .attr("id", "x-axis")
        .attr("class", "axis")
        .call(xAxis);

    const y = d3.scaleBand()
        .domain(d3.range(yLabels.length))
        .range([height - margin.bottom, margin.top])
    const yAxis = d3.axisLeft(y)
        .tickFormat((d, i) => `${yLabels[i]} ms`)
    svg.append("g")
        .attr("transform", translate(margin.left, 0))
        .attr("id", "y-axis")
        .attr("class", "axis")
        .call(yAxis);

    // draw heatmap rects
    svg.selectAll('rect')
        .data(snapBuckets)
        .enter()
        .append('rect')
        .filter(d => typeof d.freq == 'number')
        .attr('x', (d, i) => x(d.x))
        .attr('y', (d, i) => y(d.y))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', d => color(d.freq))
        .attr('stroke', d => color(d.freq))



    d3Container.append(svg.node());
}


export { drawHeatmap }
