import { merge } from 'lodash';

/*TODO
  yScale axis
  xScale axis
  Options: alternate bars between guess + answer, diff graphs, split graph in half
*/
function generateBars(graphId, options) {
  var defaults = {
    xAxisText: '',
    yAxisText: '',
    xKey: 'xScale',
    yKey: 'yScale',
    xTicks: 8,
    yTicks: 8,
    xMin: 0,
    xMax: Math.max.apply(options['data'].map( d => d[options['xKey']])),
    yMin: 0,
    yMax: Math.max.apply(options['data'].map( d => d[options['yKey']])),
    xAxisLabelFormat: '',
    yAxisLabelFormat: '',
    radius: 6,
    margin: { top: 15, right: 75, bottom: 50, left: 50 },
    width: 570,
    height: 340,
    guessDist: false,
    data: [],
    barWidth: 40,
    otherData: []
  }

  options = merge(defaults, options);

  // Assign all options keys to variables of the same name in the function scope
  var [
        barWidth,
        data,
        guessDist,
        height,
        margin,
        otherData,
        radius,
        width,
        xAxisLabelFormat,
        xAxisText,
        xKey,
        xMax,
        xMin,
        xTicks,
        yAxisLabelFormat,
        yAxisText,
        yKey,
        yMax,
        yMin,
        yTicks
      ] = Object.keys(options)
                  .sort()
                  .map( (k) => options[k] );

  // var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
  //     y = d3.scaleLinear().rangeRound([height, 0]);
  //
  // x.domain(data.map(function(d) { return d[xKey]; }));
  // y.domain([0, d3.max(data, function(d) { return d[yKey]; })]);

  var guessData = data.map( d =>  {
    return { [xKey]: d[xKey], [yKey]: yMin }
  });

  var xAxisOrder = {};

  guessData.forEach( (d, i) => {
    let xVal = d[xKey];
    xAxisOrder[xVal] = i;
  });

  var xScale = d3.scaleBand().domain(data.map( d => d[xKey])).range([0, width]).padding(.5),
      yScale = d3.scaleLinear().domain([yMin, yMax])
        .range([height, 0]);

  // var svg = d3.select("#" + graphId)
  //       .append("svg:svg")
  //       .attr("width", width)
  //       .attr("height", height);
  //
  // var g = svg.append("g")
  //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  //         .attr("height", height + margin.top + margin.bottom);

  var g = d3.select('#' + graphId)
    .append('svg:svg')
      .attr('id', 'svg-' + graphId)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('offset', 100)
      .append("g")
      .attr("transform",
        "translate(37,40)")

  // g.append("g")
  //   .attr("class", "axis axis--xScale")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(xScale));

  // g.append("g")
  //     .attr("class", "axis axis--yScale")
  //     .call(d3.axisLeft(y)
  //             .tickFormat('')
  //             .ticks(6))
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("yScale", 6)
  //     .attr("dy", "0.71em")
  //     .attr("text-anchor", "end")
  //     .text("Frequency");

  drawAxes();

  function drawAxes() {
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
              );

    // g.append("text")
    //     .attr("transform",
    //           "translate(" + (width - margin.right) + " ," +
    //                          (height + margin.top + 10) + ")")
    //     .style("font-size", "12px")
    //     .text(xAxisText);


    g.append("g")
      .call(d3.axisLeft(yScale)
              .tickFormat(d3.format(yAxisLabelFormat))
              .ticks(yTicks)
            );
    //
    // g.append("text")
    //     .attr('xScale', -30)
    //     .attr("yScale", -30)
    //     .attr("dy", "1em")
    //     .style("font-size", "12px")
    //     .text(yAxisText);
  }

  g.selectAll(".bar")
     .data(data)
   .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => xScale(d[xKey]))
     .attr("width", xScale.bandwidth())
     .attr("y", d => yScale(d[yKey]))
     .attr("height", function(d) { return height - yScale(d[yKey]); })
     .attr("fill", "#2d578b")

// var bars = g
//       .selectAll("rect")
//       .data(data)
//       .enter()
//         .append("svg:rect")
//         .attr("xScale", function(d, index) { return xScale(d[xKey])})
//         .attr("yScale", function(d, index) { return height - yScale(d[yKey])})
//         .attr("height", function(d, index) { return yScale(d[yKey]) })
//         .attr("width", barWidth)
//         .attr("fill", "#2d578b");

  // var text = bars.selectAll("text")
  //   .data(data)
  //   .enter()
  //     .append("svg:text")
  //     .attr("xScale", function(datum, index) { return xScale(index) + barWidth})
  //     .attr("yScale", function(datum, index) { return height - yScale(datum.books)})
  //     .attr("dx", -barWidth/2)
  //     .attr("dy", function(datum, index) { return height - yScale(datum.books) + 20 })
  //     .attr("text-anchor", "middle")
  //     .text(function(datum) { return yScale(datum.books);})
  //     .attr("fill", "white");

  // var drag = d3.drag().on("drag", dragHandler);
  // bars.call(drag);

  // function dragHandler() {
  //   var coord = d3.mouse(this),
  //       xScale = coord[0],
  //       yScale = coord[1];
  //
  //   var i = Math.floor(xScale / 50);
  //
  //   if(i >= bars._groups[0].length || i < 0) return;
  //   if(yScale < 0 || yScale > 200) return;
  //
  //   d3.select(bars._groups[0][i]).attr('yScale', yScale);
  //   data[i].books = Math.floor(yScale);
  //
  //   var textNode = d3.select(text._groups[0][i]);
  //   textNode._groups[0][0].textContent = Math.abs(yScale - 200);
  //   textNode.attr("dy", function(datum, index) { return yScale + 20 })
  // }
}

module.exports = generateBars;
