import classes from "./Spinner.module.css";
import * as d3 from "d3";
import data from "./data";
const padding = { top: 20, right: 40, bottom: 0, left: 0 },
  w = 500 - padding.left - padding.right,
  h = 500 - padding.top - padding.bottom,
  r = Math.min(w, h) / 2,
  rotation = 0,
  oldrotation = 0,
  picked = 100000,
  oldpick = [],
  color = d3.scale.category20();
function Spinner() {
  const load = () => {
    const svg = d3
      .select("#chart")
      .append("svg")
      .data([data])
      .attr("width", w + padding.left + padding.right)
      .attr("height", h + padding.top + padding.bottom);
    const container = svg
      .append("g")
      .attr("class", "chartholder")
      .attr(
        "transform",
        "translate(" +
          (w / 2 + padding.left) +
          "," +
          (h / 2 + padding.top) +
          ")"
      );
    const vis = container.append("g");

    const pie = d3.layout
      .pie()
      .sort(null)
      .value(function (d) {
        return 1;
      });
    // declare an arc generator function
    const arc = d3.svg.arc().outerRadius(r);
    // select paths, use arc generator to draw
    const arcs = vis
      .selectAll("g.slice")
      .data(pie)
      .enter()
      .append("g")
      .attr("class", "slice");

    arcs
      .append("path")
      .attr("fill", function (d, i) {
        return color(i);
      })
      .attr("d", function (d) {
        return arc(d);
      });
    // add the text
    arcs
      .append("text")
      .attr("transform", function (d) {
        d.innerRadius = 0;
        d.outerRadius = r;
        d.angle = (d.startAngle + d.endAngle) / 2;
        return (
          "rotate(" +
          ((d.angle * 180) / Math.PI - 90) +
          ")translate(" +
          (d.outerRadius - 10) +
          ")"
        );
      })
      .attr("text-anchor", "end")
      .text(function (d, i) {
        return data[i].label;
      });
    container.on("click", spin);
    function spin(d) {
      container.on("click", null);
      //all slices have been seen, all done
      console.log("OldPick: " + oldpick.length, "Data length: " + data.length);
      if (oldpick.length == data.length) {
        console.log("done");
        container.on("click", null);
        return;
      }
      const ps = 360 / data.length,
        pieslice = Math.round(1440 / data.length),
        rng = Math.floor(Math.random() * 1440 + 360);

      rotation = Math.round(rng / ps) * ps;

      picked = Math.round(data.length - (rotation % 360) / ps);
      picked = picked >= data.length ? picked % data.length : picked;
      if (oldpick.indexOf(picked) !== -1) {
        d3.select(this).call(spin);
        return;
      } else {
        oldpick.push(picked);
      }
      rotation += 90 - Math.round(ps / 2);
      vis
        .transition()
        .duration(3000)
        .attrTween("transform", rotTween)
        .each("end", function () {
          //mark question as seen
          d3.select(".slice:nth-child(" + (picked + 1) + ") path");
          //populate question
          d3.select("#question h1").text(data[picked].question);
          oldrotation = rotation;

          /* Get the result value from object "data" */
          console.log(data[picked].value);

          /* Comment the below line for restrict spin to sngle time */
          container.on("click", spin);
        });
    }
    //make arrow
    svg
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (w + padding.left + padding.right) +
          "," +
          (h / 2 + padding.top) +
          ")"
      )
      .append("path")
      .attr("d", "M-" + r * 0.15 + ",0L0," + r * 0.05 + "L0,-" + r * 0.05 + "Z")
      .style({ fill: "black" });
    //draw spin circle
    container
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 60)
      .style({ fill: "white", cursor: "pointer" });
    //spin text
    container
      .append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("SPIN")
      .style({ "font-weight": "bold", "font-size": "30px" });

    function rotTween(to) {
      const i = d3.interpolate(oldrotation % 360, rotation);
      return function (t) {
        return "rotate(" + i(t) + ")";
      };
    }

    function getRandomNumbers() {
      const array = new Uint16Array(1000);
      const scale = d3.scale.linear().range([360, 1440]).domain([0, 100000]);
      if (
        window.hasOwnProperty("crypto") &&
        typeof window.crypto.getRandomValues === "function"
      ) {
        window.crypto.getRandomValues(array);
        console.log("works");
      } else {
        //no support for crypto, get crappy random numbers
        for (const i = 0; i < 1000; i++) {
          array[i] = Math.floor(Math.random() * 100000) + 1;
        }
      }
      return array;
    }
  };

  return (
    <div>
      <div className={classes.chart}></div>
      <div className={classes.question}></div>
    </div>
  );
}

export default Spinner;
