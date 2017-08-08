var infoBox = d3.select("body").append("div")
    .attr("class", "operatorTip")
    .style("opacity", 0);

var countryBox = d3.select("body").append("div")
    .attr("class", "countryTip")
    .style("opacity", 0);

var r = d3.format(".0f");
var f = d3.format(".1f");
var p = d3.format('.0%');

var totSpec = "";
var sumSpec = 0;
var topOffset = d3.select(".tab-content").node().getBoundingClientRect()["top"];

/* Display 900MHz assignments */
displayAssignments(900, 880, 960, 915, 925);
/* Display 1800MHz assignments */
displayAssignments(1800, 1710.2, 1879.8, 1784.8, 1805.2);
/* Display 2100MHz assignments */
displayAssignments(2100, 1920, 2170, 1980, 2110);
/* Display 2600MHz assignments */
displayAssignments(2600, 2500, 2690, 2570, 2620);

function displayAssignments(freqRange, bandStart, bandEnd, guardStart, guardEnd) {
    // displayAssignments imports a csv file of spectrum assignments 
    // for a given frequency range and displays them as a chart

    var specFile = freqRange + "MHz.csv",
        specID = "#MHz" + freqRange;
    /* console.log("file: " + specFile);    */

    var MHz = d3.select(specID),
        margin = { top: 60, right: 50, bottom: 30, left: 120 },
        width = +MHz.attr("width") - margin.left - margin.right,
        height = +MHz.attr("height") - margin.top - margin.bottom,
        availSpec = bandEnd - bandStart + guardStart - guardEnd,
        totSpec = "",
        sumSpec = 0,
        midRect = 0,
        freqLeft = 0,
        freqRight = 0,
        freqMid = 0;

    var x = d3.scaleLinear().rangeRound([0, width]),
        y = d3.scaleBand().rangeRound([0, height]).padding(0.1);

    var h = MHz.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var guardBand = "";
    if (freqRange == "2600") {
        guardBand = "TDD";
    } else if (freqRange == "2100") {
        guardBand = "Something Else";
    } else {
        guardBand = "Guard Band";
    }

    /* Load data from 1800 MHz file */
    d3.csv(specFile, function(d) {
        d.freqStart = +d.freqStart;
        d.freqEnd = +d.freqEnd;
        return d;
    }, function(error, data) {
        if (error) throw error;

        /* Sort data by Country */
        data = data.sort(function(a, b) {
            return d3.ascending(a.Country, b.Country);
        });

        //        x.domain([d3.min(data, function(d) { return d.freqStart; }), d3.max(data, function(d) { return d.freqEnd; })]);
        x.domain([d3.min(data, function(d) { return d.freqStart; }), d3.max(data, function(d) { return d.freqEnd; })]);
        y.domain(data.map(function(d) { return d.Country; }));


        /* Set lower X-axis and legend */
        h.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(20).tickSize(-height))
            .append("text")
            .attr("x", 20)
            .attr("y", 30)
            .text("Frequency (MHz)");

        /* Set X-axis at top and add title/legend */
        h.append("g")
            .attr("class", "axis axis--x")
            .call(d3.axisTop(x).ticks(20).tickSize(-height))
            .append("text")
            .classed("FreqLegend", true)
            .attr("x", 20)
            .attr("y", -30)
            .text(freqRange + " MHz Band");

        /* Set Y-axis in 1800*/
        h.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).tickSize(5))
            .selectAll(".tick text")
            .classed("countryStyle", true)
            .call(wrap, margin.left);


        /*  Build mouseover infobox for each country in y axis legend in 1800 */
        h.selectAll(".axis--y .tick text")
            .on("mouseover", function() {
                totSpec = 0;
                var myElement = d3.select(this);
                var countryName = myElement.text();
                /* determine y coordinates of row selected */
                var yText = getTranslation(d3.select(this.parentNode).attr("transform"));
                var midLine = yText[1];
                var topOfBox = yText[1] + y.bandwidth() + window.pageYOffset;
                /*  determine absolute coordinates for left edge of SVG */
                var matrix = this.getScreenCTM()
                    .translate(+this.getAttribute("cx"), +this.getAttribute("cy"));
                h.selectAll("." + countryName.replace(/\s+/g, '_')).each(function(d) {
                    totSpec += d.freqEnd;
                    totSpec -= d.freqStart;
                    sumSpec = sumSpec + d.freqEnd - d.freqStart;
                });
                var availPercent = totSpec / availSpec;
                
                /* var circle = h.append("circle")
                          .attr("cx",  matrix.e )
                          .attr("cy", midLine )
                          .attr("r", y.bandwidth()/2)
                          .attr("fill", "#FF0000");  */
                countryBox.transition()
                    .duration(200)
                    .style("opacity", .9);
                countryBox.html(countryName + '</br>' + r(totSpec) + ' MHz assigned out of ' + r(availSpec) + ' MHz available. <br><b>Band occupancy ' + p(availPercent) + '</b>')
                    .style("left", (window.pageXOffset + matrix.e) + "px")
                    .style("top", topOfBox  + "px")
                    .style("height", y.bandwidth() + "px")
                    .style("width", width + "px");
                    console.log("topOfBox: " + topOfBox);

            })
            .on("mouseout", function() {
                countryBox.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        /* Add rectangles for guards bands */
        h.selectAll("guard")
            .data(data)
            .enter().append("g")
            .attr("class", "guardbands")
            .append("rect")
            .attr("class", "guardband")
            .attr("y", function(d) { return y(d.Country); })
            .attr("x", x(guardStart))
            .attr("width", function(d) { return x(guardEnd) - x(guardStart); })
            .attr("height", y.bandwidth());

        /* Add label to guardbands */
        h.selectAll(".guardbands")
            .append("text")
            .attr("class", "label")
            .attr('transform', 'rotate(-90)')
            .attr("y", function(d) { return x(guardStart) + (x(guardEnd) - x(guardStart)) / 2 + 5; })
            .attr("x", function(d) { return -y(d.Country) - y.bandwidth() + 10; })
            .text(guardBand)
            .call(wrap, y.bandwidth() - 10);

        /* Iterate through data file */
        h.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bars")
            .append("rect")
            .attr("class", function(d) { return d.Operator.replace(/\s+/g, '_').replace(/\W/g, '') + " " + d.Country.replace(/\s+/g, '_'); })
            .classed("bar", true)
            .attr("y", function(d) { return y(d.Country); })
            .attr("x", function(d) { return x(d.freqStart); })
            .attr("width", function(d) { return x(d.freqEnd) - x(d.freqStart); })
            .attr("height", y.bandwidth());

        /* Add operator label to each spectrum assignment */
        var bars = MHz.selectAll(".bars");

        bars.append("text")
            .attr("class", "label")
            .attr('transform', 'rotate(-90)')
            .attr("y", function(d) { return x(d.freqStart) + (x(d.freqEnd) - x(d.freqStart)) / 2 + 5; })
            .attr("x", function(d) { return -y(d.Country) - y.bandwidth() + 10; })
            .text(function(d) { return d.Operator; })
            .call(wrap, y.bandwidth());

        /* MHz ToolTip for each operator spectrum assignment */
        bars.on("mouseover", function(d) {
                /* calculate total spectrum assigned */
                var infoB = h.selectAll("." + d.Operator.replace(/\s+/g, '_').replace(/\W/g, '') + "." + d.Country.replace(/\s+/g, '_')).each(function(d, i) {
                    totSpec = f(d.freqEnd - d.freqStart) + " + " + totSpec;
                    sumSpec = sumSpec + d.freqEnd - d.freqStart;
                    midRect = x(d.freqStart + (d.freqEnd - d.freqStart)/2);
                    h.append("line")
                        .style("stroke", "red")
                        .style("stroke-width", "5")
                        .attr( "class", "infoLine") 
                        .attr( "x1" , midRect)
                        .attr( "y1" , y(d.Country) + y.bandwidth())
                        .attr( "x2" , midRect)
                        .attr( "y2" , y(d.Country) + y.bandwidth() + 13 );
                    if (freqLeft > d.freqStart || freqLeft === 0) freqLeft = d.freqStart;
                    if (freqRight < d.freqEnd)  freqRight = d.freqEnd;
                    // console.log("i:" + i + " d.freqStart: " + d.freqStart + " d.freqEnd: " + d.freqEnd);
                    // console.log("freqLeft: " + freqLeft + " freqRight: " + freqRight);
                });
                // console.debug(infoB);
                infoB.classed("selected", true);
                freqMid = f(freqLeft + (freqRight - freqLeft)/2);
                // console.log("freqLeft: " + freqLeft +" freqRight: " + freqRight + " freqMid: " + freqMid);

                freqLeft = freqLeft + (d.freqEnd - d.freqStart)/2;
                freqRight = freqRight - (d.freqEnd - d.freqStart)/2;
                h.append("line")
                        .style("stroke", "red")
                        .style("stroke-width", "5")
                        .attr( "class", "infoLine") 
                        .attr( "x1" , x(freqMid))
                        .attr( "y1" , y(d.Country) + y.bandwidth() + 13)
                        .attr( "x2" , x(freqMid))
                        .attr( "y2" , y(d.Country) + y.bandwidth() + 20 );

                h.append("line")
                        .style("stroke", "red")
                        .style("stroke-width", "5")
                        .attr( "class", "infoLine") 
                        .attr( "x1" , x(freqLeft))
                        .attr( "y1" , y(d.Country) + y.bandwidth() + 10)
                        .attr( "x2" , x(freqRight))
                        .attr( "y2" , y(d.Country) + y.bandwidth() + 10 );

                infoBox.transition()
                    .duration(200)
                    .style("opacity", 1);
                infoBox.html('<table class="table"><tr><td>Country</td><td>' + d.Country + '</td></tr><tr><td>Operator:</td><td>' + d.Operator + '</td></tr><tr><td>Band:</td><td>' + d.Band + '</td></tr><tr><td>Assignment:</td><td>' + totSpec.replace(/\s\+\s$/, '') + ' MHz</td></tr><tr><td>Total:</td><td>' + f(sumSpec) + " MHz</td><tr></table>")
                    .style("left", x(freqMid) - margin.left + 21 + "px")
                    .style("top", y(d.Country) + y.bandwidth() + topOffset + margin.top + 25 + "px");
                // console.log("d.Country: " + y(d.Country) + " y.bandwidth: " + y.bandwidth() + " topOffset: " + topOffset);
            })
            .on("mouseout", function(d) {
                totSpec = "";
                sumSpec = 0;
                freqLeft = 0;
                freqRight = 0;
                freqRange = 0;
                h.selectAll("line.infoLine").remove();
                h.selectAll("." + d.Operator.replace(/\s+/g, '_').replace(/\W/g, '') + "." + d.Country.replace(/\s+/g, '_'))
                    .classed("selected", false)
                infoBox.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });
}


function getTranslation(transform) {
    /* Create a dummy g for calculation purposes only. This will never
       be appended to the DOM and will be discarded once this function 
       returns.  */
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    /* Set the transform attribute to the provided string value. */
    g.setAttributeNS(null, "transform", transform);

    /* consolidate the SVGTransformList containing all transformations
       to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
       its SVGMatrix.  */
    var matrix = g.transform.baseVal.consolidate().matrix;

    /* As per definition values e and f are the ones for the translation. */
    return [matrix.e, matrix.f];
}

function wrap(text, width) {
    /* wrap text function, taken from
       https://gist.github.com/ericsoco/647db6ebadd4f4756cae */

    text.each(function() {
        var breakChars = ['/', '&', '-'],
            text = d3.select(this),
            textContent = text.text(),
            spanContent;
        breakChars.forEach(char => {
            /* Add a space after each break char for the function to use to determine line breaks */
            textContent = textContent.replace(char, char + ' ');
        });
        var words = textContent.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr('x'),
            y = text.attr('y'),
            dy = parseFloat(text.attr('dy') || 0),
            tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            /* console.log("text:" + tspan.text() +" Length: " + tspan.node().getComputedTextLength());  */
            var tabs = d3.selectAll('div.tab-pane').classed('tab-pane', false).classed('fade', false);
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                spanContent = line.join(' ');
                breakChars.forEach(char => {
                    /* Remove spaces trailing breakChars that were added above */
                    spanContent = spanContent.replace(char + ' ', char);
                });
                tspan.text(spanContent);
                line = [word];
                tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
            }
            tabs.classed('tab-pane', true).classed('fade', true);
        }
    });
}