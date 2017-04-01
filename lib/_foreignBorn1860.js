// https://www.brookings.edu/blog/brookings-now/2013/10/03/what-percentage-of-u-s-population-is-foreign-born/
const width = 570,
      height = 340,
      radius = 5,
      numYears =  16,
      margin = {top: 15, right: 20, bottom: 50, left: 70};

const data = [
               { year: 1860, percentage: 0.132 },
               { year: 1870, percentage: 0.144 },
               { year: 1880, percentage: 0.133 },
               { year: 1890, percentage: 0.148 },
               { year: 1900, percentage: 0.136},
               { year: 1910, percentage: 0.147 },
               { year: 1920, percentage: 0.132 },
               { year: 1930, percentage: 0.116 },
               { year: 1940, percentage: 0.088 },
               { year: 1950, percentage: 0.069 },
               { year: 1960, percentage: 0.054 },
               { year: 1970, percentage: 0.047},
               { year: 1980, percentage: 0.062},
               { year: 1990, percentage: 0.079},
               { year: 2000, percentage: 0.111},
               { year: 2010, percentage: 0.129}
             ]

var svg = d3.select('#foreignBorn')
  .append('svg:svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(37,40)")
  .attr('style', "-webkit-tap-highlight-color: rgba(0, 0, 0, 0);");

var xScale = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([0, width])

var yScale = d3.scaleLinear()
      .domain([0, 0.2])
      .range([height, 0]);

drawGrid()
drawAxes()

function drawAxes() {
  svg.append("g")
      .attr('class', 'axisX')
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)
              .tickFormat(d3.format('d'))
            );

  svg.append("text")
      .attr("transform",
            "translate(" + (width - margin.right) + " ," +
                           (height + margin.top + 10) + ")")
      .style("font-size", "12px")
      .text("Year");

  svg.append("g")
    .call(d3.axisLeft(yScale)
            .tickFormat(d3.format('.0%'))
          );

  svg.append("text")
      .attr('x', -30)
      .attr("y", -30)
      .attr("dy", "1em")
      .style("font-size", "12px")
      .text("Percentage foreign born");
}

function make_x_gridlines() {
    return d3.axisBottom(xScale)
        .ticks(6)
}

function make_y_gridlines() {
    return d3.axisLeft(yScale)
        .ticks(10)
}

function drawGrid () {
  svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat(""))

  svg.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )
}

svg.append('text')
  .attr('id', 'drawYourLine')
  .attr("transform",
        "translate(" + (width/2 + 2) + " ," +
                       (height/2 - 2) + ")")
  .style('text-anchor', 'middle')
  .style("font-size", "26px")
  .text("Draw your line!");

var guessData = data
      .map((d) => {
        return { year: d.year, percentage: d.percentage, defined: false }
      });

var body = d3.select('svg')
var drag = d3.drag().on("drag", dragHandler);
body.call(drag);

function dragHandler() {
  var coord = d3.mouse(this),
      year = clamp(1850, 2010, Math.floor(xScale.invert(coord[0]) / 10) * 10);
      percentage = clamp(0, 0.20, Math.round(yScale.invert(coord[1])*100) / 100);

  svg.select('.hoverText').remove();
  svg.select("#drawYourLine").remove();

  guessData.forEach(function(d) {
    if (Math.abs(d.year - year) === 0) {
      d.percentage = percentage;
      d.defined = true;
    } else if(d.year < year && !d.defined){
      d.percentage = percentage;
      d.defined = true;
    }
  })

  var defined = selectDefined(guessData),
      incomplete = selectIncomplete(defined),
      beforeAnswer = document.getElementById('foreignBorn-beforeGuess');

  if(complete(defined) && defined.length === data.length) {
    beforeAnswer.classList.remove('foreignBorn-beforeGuessComplete');
    beforeAnswer.classList.add('foreignBorn-afterGuessComplete');

    beforeAnswer.addEventListener('click', drawAnswerPath);
  } else {
    beforeAnswer.removeEventListener('click', drawAnswerPath);
  }

  drawCircles('guessCirclesG', defined, '#FF4136');
  drawPath(defined);
  drawIncompleteRange(incomplete);
}

var guessCircles = svg
  .append('g')
  .attr('id', 'guessCirclesG');
var answerCircles = svg
  .append('g')
  .attr('id', 'answerCirclesG')

function drawCircles(id, data, color) {
  svg.select('#' + id).remove();

  var originalRadius = id === 'answerCirclesG' ? 0 : radius;

  svg
    .append('g')
    .attr('id', 'guessCirclesG')
    .selectAll('circle')
    .data(data)
    .enter()
      .append('circle')
      .attr('r', originalRadius)
      .attr('cx', function(d) { return xScale(d.year) })
      .attr('cy', function(d) { return yScale(d.percentage) })
      .attr('fill', color)
      .attr('class', 'guessCircles')
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut(color))
      .transition()
        .duration(3000)
        .attr('r', radius)
}

function handleMouseOver(d, i) {
  var id = "hoverT-" + Math.round(d.year) + "-" + Math.round(d.percentage * 100) + "-" + i;

  d3.select(this)
    .attr('fill', '#ffc700')
    .attr('r', radius + 1)

    svg.append("text")
      .attr( 'id', id)
      .attr('x', () => width / 2 - 18)
      .attr('y', () => -14)
      .attr('class', 'hoverText')
      .text(() => [d.year + ': ' + (d.percentage * 100).toFixed(1) + '%'] );
}

function handleMouseOut(color) {
    return function(d, i) {
      var id = "hoverT-" + Math.round(d.year) + "-" + Math.round(d.percentage * 100) + "-" + i

      d3.select(this)
        .attr('fill', color)
        .attr('r', radius)

      d3.select("#" + id).remove();
    }
}

// Check whether the drawn line is complete
function complete(data) {
  for(let d of data) {
    if(d['defined'] === undefined) {
      return false
    }
  }

  return true;
}

// Three lines for three paths
var answerLine = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.percentage));

var guessLine = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.percentage));

var incompleteRangeLine = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.percentage));

// Select defined data
function selectDefined(data) {
  var defined = [];

  for(var d of data) {
    if(d.defined) {
      defined.push(d);
    }
  }

  return defined;
}

// Select points for incomplete data range
function selectIncomplete(guessData) {
  if(data.length === guessData.length) {
    return [];
  } else {
    var firstIncompleteYear = data[guessData.length - 1].year;
    return [
      { year: firstIncompleteYear, percentage: 0.0, defined: true},
      { year: firstIncompleteYear, percentage: 0.20, defined: true},
      { year: 2010, percentage: 0.20, defined: true},
      { year: 2010, percentage: 0.0, defined: true}
    ]
  }
}

var path = svg.append('path');

function drawPath(data) {
    path
      .attr('d', guessLine.defined((d) => d.defined)(data))
      .attr('class', 'guessLine')
}

var incompleteRange = svg.append('path');

function drawIncompleteRange(incomplete) {
  incompleteRange
    .attr('d', incompleteRangeLine.defined(d => d.defined)(incomplete))
    .attr('class', 'incompleteRange')
}

function drawAnswerPath() {
  var path = svg
  .append('path')
  .data([data])
  .attr('class', 'answerLine')
  .attr('stroke-width', 2)
  .attr('d', answerLine);

  var length = path.node().getTotalLength();

  path.attr("stroke-dasharray", length + " " + length)
     .attr("stroke-dashoffset", length)
     .transition()
       .duration(2000)
       .attr("stroke-dashoffset", 0);

  drawCircles('answerCirclesG', data, 'steelblue');

  var answerText = document.getElementById('foreignBorn-answerText'),
      beforeGuess = document.getElementById('foreignBorn-beforeGuess');

  answerText.classList.remove('hidden');
  beforeGuess.classList.remove('foreignBorn-afterGuessComplete');
  beforeGuess.classList.add('hidden');
}

function clamp(a, b, c){
  return Math.max(a, Math.min(b, c));
}
