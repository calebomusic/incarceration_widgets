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
    return { [xKey]: d[xKey], [yKey]: Math.floor(yMax / 2) }
  });

  var xAxisOrder = {};

  var xScale = d3.scaleBand().domain(data.map( d => d[xKey])).range([0, width]).padding(.25),
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

  var guess = d3.select('#' + graphId)
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
  drawGrid();
  drawAxes(guess);
  var guessBars = drawBars(guess, guessData),
      text = addLabels(guess, guessData, true),
      complete = false;

  function drawAxes(g) {
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

  function drawBars(g, data, className = 'bar') {
    return g.selectAll('.' + className)
               .data(data)
             .enter().append("rect")
               .attr("class", className)
               .attr("x", d => xScale(d[xKey]))
               .attr("width", '0px')
               .attr("y", d => yScale(d[yKey]))
               .attr("height", function(d) { return height - yScale(d[yKey]); })
               .attr("fill", "#2d578b")
               .transition()
                 .duration(2000)
                 .attr("width", xScale.bandwidth());
  }

  // Useful for answer, not so useful for guess.
  function addLabels(g, data, init, className = 'label') {
    var label = init ? '?' : d => d[yKey];

    return  g.selectAll("." + className)
      .data(data)
      .enter()
        .append("text")
        .attr("class", className)
        .attr("x", d => xScale(d[xKey]) + (xScale.bandwidth() / 2))
        .attr("y", d => yScale(d[yKey]) + 20)
        .attr("text-anchor", "middle")
        .text(label)
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "white")
        .style("opacity", '0')
        .transition()
          .duration(2500)
          .style("opacity", "1");
  }

  var drag = d3.drag()
               .on("drag", dragHandler);
              //  .on("mouseover", dragEndHandler);

  var body = d3.select('#svg-' + graphId);
  body.call(drag);

  var initText = otherData.length === 0 ? 'Guess!' : '';

  guess.append('text')
    .attr('id', 'drawYourLine')
    .attr("transform",
          "translate(" + (width/2 + 2) + " ," +
                         (height/2 - 2) + ")")
    .style('text-anchor', 'middle')
    .style("font-size", "26px")
    .text(initText);

  function dragHandler(g) {
    var coord = d3.mouse(this),
        xVal = getXVal(coord[0]),
        yVal = yScale.invert(coord[1]),
        y = coord[1];

    guess.select("#drawYourLine").remove();

    if(yVal <= 0 || yVal >= yMax) {
      return;
    }
    // var i = Math.floor(x / 50);

    // if(i >= guessBars._groups[0].length || i < 0) return;
    // if(y < 0 || y > 200) return;

    d3.select(guessBars._groups[0][xVal])
        .attr('y', y)
        .attr("height", height - y)

    var textNode = d3.select(text._groups[0][xVal]);

    if(yVal > Math.floor(yMax / 20)) {
      textNode._groups[0][0] && (textNode._groups[0][0].textContent = Math.floor(yVal));
      textNode.attr("y", y + 20);
    } else {
      textNode._groups[0][0] && (textNode._groups[0][0].textContent = '');
    }

    if(complete === false) {
      checkComplete();
    }
  }

  function checkComplete() {
    let labels = d3.selectAll('.label')._groups[0];

    for(let label of labels) {
      if(label.textContent === '?') {
        return false;
      }
    }

    var beforeAnswer = document.getElementById('beforeGuess-' + graphId);

    beforeAnswer.classList.remove('beforeGuessComplete-' + graphId);
    beforeAnswer.classList.add('afterGuessComplete-' + graphId);

    beforeAnswer.addEventListener('click', drawAnswerGraph);

    complete = true;
  }

  // Draw on guess version
  function drawAnswerGraph() {
    drawBars(guess, data, 'answerBars');
    addLabels(guess, data, false, 'answerText');

    var afterAnswer = document.getElementById('beforeGuess-' + graphId),
        answerText = document.getElementById('answerText-' + graphId);

    afterAnswer.classList.add('beforeGuessComplete-' + graphId);
    afterAnswer.classList.remove('afterGuessComplete-' + graphId);

    afterAnswer.removeEventListener('click', drawAnswerGraph);

    answerText.classList.remove('hidden');

    var drag = d3.drag().on('drag', null);

    body.call(drag);
  }

  function make_x_gridlines() {
      return d3.axisBottom(xScale)
          .ticks(xTicks)
  }

  function make_y_gridlines() {
      return d3.axisLeft(yScale)
          .ticks(yTicks)
  }

  function drawGrid () {
    guess.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(0," + height + ")")
          .call(make_x_gridlines()
              .tickSize(-height)
              .tickFormat(""))

    guess.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )
  }

  // NOT CURRENTLY USING
  function dragEndHandler() {
    var coord = d3.mouse(this),
        xVal = getXVal(coord[0]),
        yVal = yScale.invert(coord[1]),
        y = coord[1];

    var textNode = d3.select(text._groups[0][xVal]);
        textNode._groups[0][0].textContent = Math.floor(yVal);
        textNode.attr("y", y + 20);
  }

  function getXVal(coord) {
    var domain = xScale.domain(),
        max = xScale.range()[1],
        step = Math.floor(max/ data.length);

    // TODO: Hardcoded!
    return Math.floor((coord - 30)/ step);
  }

  function clamp(a, b, c){
    return Math.max(a, Math.min(b, c));
  }
}

module.exports = generateBars;
