const generateGraph = require("./generateGraph.js");
const generateNumGuessWidget = require("./generateNumGuessWidget.js");
const generateBars = require("./generateBarWidget.js");

document.addEventListener('DOMContentLoaded', () => {
  const incarcerationOverTime = [ { year: 1925, population: 91.669 },
                                  { year: 1930, population: 129.453 },
                                  { year: 1935, population: 144.180 },
                                  { year: 1940, population: 173.706 },
                                  { year: 1945, population: 133.649 },
                                  { year: 1950, population: 166.123 },
                                  { year: 1955, population: 185.780 },
                                  { year: 1960, population: 212.953 },
                                  { year: 1965, population: 210.895 },
                                  { year: 1970, population: 196.429 },
                                  { year: 1975, population: 240.593 },
                                  { year: 1980, population: 329.821 },
                                  { year: 1985, population: 502.507 },
                                  { year: 1990, population: 771.243 },
                                  { year: 1995, population: 1125.874 },
                                  { year: 2000, population: 1381.892 },
                                  { year: 2005, population: 1462.866  },
                                  { year: 2010, population: 1552.669 },
                                  { year: 2015, population: 1476.847 } ]

  const incarcerationOverTimeOptions = {
    xAxisText: 'Year',
    yAxisText: 'Population in Thousands',
    yMin: 0,
    yMax: 1500,
    xKey: 'year',
    yKey: 'population',
    xMin: 1925,
    xMax: 2015,
    xAxisLabelFormat: 'd',
    yAxisLabelFormat: '',
    xTicks: 10,
    yTicks: 5,
    width: 600,
    data: incarcerationOverTime
  }

  generateGraph('incarcerationOverTime', incarcerationOverTimeOptions);

  const internationalIncarceration = [
    { country: "United States", rate: 670 },
    { country: "Russia", rate: 439 },
    { country: "Canada", rate: 114 },
    { country: "Germany", rate: 76}
  ]

  const internationalIncarcerationOptions = {
    xAxisText: 'Country',
    yAxisText: 'Incarceration rate per 100,000',
    yMin: 0,
    yMax: 800,
    xKey: 'country',
    yKey: 'rate',
    xAxisLabelFormat: '',
    yAxisLabelFormat: '',
    xTicks: 10,
    yTicks: 5,
    width: 400,
    height: 400,
    data: internationalIncarceration
  }
  generateBars('internationalIncarceration', internationalIncarcerationOptions);

  const raceAndEthnicity = [
    { group: 'White', rate: 312 },
    { group: 'Black', rate: 1745 },
    { group: 'Hispanic', rate: 820 }
  ]

  const raceAndEthnicityOptions = {
    yAxisText: 'Incarceration Rate per 100,000',
    yMin: 0,
    yMax: 2000,
    xKey: 'group',
    yKey: 'rate',
    xAxisLabelFormat: '',
    yAxisLabelFormat: '',
    xTicks: 10,
    yTicks: 5,
    width: 400,
    height: 400,
    data: raceAndEthnicity
  }

  generateBars('raceAndEthnicity', raceAndEthnicityOptions);

  const native = [
    { year: 1980, incarcerated: 0.014 },
    { year: 1990, incarcerated: .022 },
    { year: 2000, incarcerated: .035 },
    { year: 2010, incarcerated: .033 }
  ]

  const nonNative = [
    { year: 1980, incarcerated: .004 },
    { year: 1990, incarcerated: .011 },
    { year: 2000, incarcerated: .007 },
    { year: 2010, incarcerated: .016 }
  ]

  const nativeAndNonNativeOptions= {
    xAxisText: 'Year',
    yAxisText: 'Incarceration Rate',
    yMin: 0,
    yMax: 0.04,
    xKey: 'year',
    yKey: 'incarcerated',
    xMin: 1980,
    xMax: 2010,
    xAxisLabelFormat: 'd',
    yAxisLabelFormat: '.0%',
    xTicks: 5,
    yTicks: 5,
    width: 600,
    data: nonNative,
    otherData: [native]
  }

  generateGraph('nativeAndNonNative', nativeAndNonNativeOptions);
});
