import { merge } from 'lodash';

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

  var guessData = data.map( d =>  {
    return { [xKey]: d[xKey], [yKey]: Math.floor(yMax / 2) }
  });

  var xAxisOrder = {};

  var xScale = d3.scaleBand().domain(data.map( d => d[xKey])).range([0, width]).padding(.25),
      yScale = d3.scaleLinear().domain([yMin, yMax])
        .range([height, 0]);

  var guess = d3.select('#' + graphId)
    .append('svg:svg')
      .attr('id', 'svg-' + graphId)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('offset', 100)
      .append("g")
      .attr("transform",
        "translate(37,40)")

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

    g.append("g")
      .call(d3.axisLeft(yScale)
              .tickFormat(d3.format(yAxisLabelFormat))
              .ticks(yTicks)
            );
    g.append("text")
        .attr('x', -30)
        .attr("y", -30)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .text(yAxisText);
  }

  function drawBars(g, data, className = ('bars-' + graphId)) {
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
  function addLabels(g, data, init, className = ('label-' + graphId)) {
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
    let labels = d3.selectAll('.label-' + graphId)._groups[0];

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

  function drawAnswerGraph() {
    drawBars(guess, data, 'answerBars-' + graphId);
    addLabels(guess, data, false, 'answerText');

    var afterAnswer = document.getElementById('beforeGuess-' + graphId),
        answerText = document.getElementById('answerText-' + graphId),
        bars = document.getElementsByClassName('bars-' + graphId);

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
