// Here we find all the libraries that we need

import * as d3 from "d3";
import * as topojson from "topojson-client";
const chinajson = require("./china.json");
import { latLongCommunities } from "./communities";
import { stats22January, stats23February,stats23March, ResultEntry } from "./stats";

// This function takes two arguments(CCAA and an array of ResultEntry) and return a radius based on the max value of the scale

const calculateRadiusBasedOnAffectedCases = (comunidad: string, data: ResultEntry[]) => {

  // Here maxAffected calculates the max value of the array

  const maxAffected =
  data.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0);
  
  // Here affectedRadiusScale calculates the scale depending of the max value previously calculated

  const affectedRadiusScale =
  d3
  .scaleLinear()
  .domain([0, 0.0005*maxAffected, 0.001*maxAffected, 0.005*maxAffected, 0.01*maxAffected, 0.02*maxAffected, maxAffected])
  .range([0, 2.55, 5 , 7.5, 15, 30, 100]);

  // Now the variable entry finds the CCAA and the value of infected people with the name of the CCAA

  const entry = data.find(item => item.name === comunidad);
  return entry ? affectedRadiusScale(entry.value) : 0;
  };

  const assignCCAABackgroundColor = (comunidad: string, data: ResultEntry[]) => {
  
    // Here maxAffected calculates the max value of infected people of the array
  
    const maxAffected =
    data.reduce(
      (max, item) => (item.value > max ? item.value : max),
      0);
    
    // Here color calculates the scale depending of the max value previously calculated
  
    const color =
    d3
    .scaleThreshold<number, string>()
    .domain([0, 0.0005*maxAffected, 0.001*maxAffected, 0.005*maxAffected, 0.01*maxAffected, 0.05*maxAffected, maxAffected])
    .range([
      "#FFFFF",
      "#E1E9F4",
      "#C4D4E9",
      "#A5BFDE",
      "#86AAD3",
      "#6496C8",
      "#25415A"
    ]);
    
    // Now the variable item finds the CCAA name and the value of infected people with the name of the CCAA

    const item = data.find(
      item => item.name === comunidad
    );

    if (item) {
      console.log(item.value);
    }

    // At the end of this function the value required is returned

    return item ? color(item.value) : color(0);
  };


// Here a backgroung will be created with the color #FBFAF0

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

// aProjection adjust the map of Spain with a correct scale and correctly centered

const aProjection = d3
.geoMercator()
// Let's make the map bigger to fit in our resolution
.scale(900)
// Let's center the map
.translate([-1100, 1000]);

// In the following variables it will be convertered the topojson to a geojson

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(
  chinajson,
  chinajson.objects.CHN_adm1
);

// Now the initial map of China will be displayed

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any);

// Then it will be calculated the coordinates of X, Y of the circles of the province

svg
  .selectAll("circle") // Select all the circles
  .data(latLongCommunities)
  .enter()
  .append("circle") // Aggregate all the circles
  .attr("class", "affected-marker")
  .attr("cx", d => aProjection([d.long, d.lat])[0]) // Calculate the X position
  .attr("cy", d => aProjection([d.long, d.lat])[1]); // Calculate the Y position

// updateColorsansRadius takes an argument(array ResultEntry) and calculates the color and the radius for each province

const updateColorsandRadius = (data: ResultEntry[]) => {
  const ccaa = svg.selectAll("path");
  ccaa
    .data(geojson["features"])
    .merge(ccaa as any)
    .transition()
    .duration(500)
    .style("fill", function(d: any) {
      return assignCCAABackgroundColor(d.properties.NAME_1, data);
    })
    const circles = svg.selectAll("circle");
    circles
      .data(latLongCommunities)
      .merge(circles as any)
      .transition()
      .duration(500)
      .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name, data));
    };
  
  // Here with the buttom in HTML "22 January", the map of infected people in that date will be displayed

  document
  .getElementById("22January")
  .addEventListener("click", function handleInfected23February() {
    updateColorsandRadius(stats22January);
  });

  // Here with the buttom in HTML "23 February", the map of infected people in that date will be displayed

  document
  .getElementById("23February")
  .addEventListener("click", function handleInfected23March() {
    updateColorsandRadius(stats23February);
  });

  // Here with the buttom in HTML "23 March", the map of infected people in that date will be displayed
  
  document
  .getElementById("23March")
  .addEventListener("click", function handleInfected23March() {
    updateColorsandRadius(stats23March);
  });
