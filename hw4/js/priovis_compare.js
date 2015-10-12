/*globals d3*/

/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 * Modified by Alex Bigelow (alex.bigelowsite.com) on 9/25/15.
 */

/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

/**
 * PrioVisCmp object for HW4
 * @param _parentElement -- the (D3-selected) HTML or SVG element to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
function PrioVisCmp (_parentElement, _data, _metaData) {
    /**
     * A word about "this":
     *
     * The meaning of "this" can change from function call to function call; the way
     * we have implemented the class, "this" refers to the PrioVisCmp class
     * in each of the PrioVisCmp.prototype.xxxxxxxx = functions.
     * However, when you create inline functions, "this" often refers
     * to something else. Usually it points to the function itself. In D3
     * .attr(function (d, i) {}) functions, for example, "this" refers
     * to the DOM element that corresponds to the "d" data value.
     * 
     * It's usually a good idea to store a reference to the class itself
     * so that you can still refer to the class inside one of these functions;
     * in this case, we rename the class-level "this" as "self" (though you
     * could name it anything you want).
     */
    var self = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.metaData = _metaData;
    self.displayData = [];

    self.initVis();
}


/**
 * Method should be called as soon as data is available.. sets up the SVG and the variables
 */
PrioVisCmp.prototype.initVis = function () {
    var self = this; // read about the this
    
    //Add Info
    var dataSet = [0, 21, 56, 91, 126, 160, 195, 230, 265, 300];
    self.chartInfo = document.getElementById("prioVisCmpInfo"); 
    self.chartInfo.innerHTML = "Priorities Compare Distribution <br>" + '<font color="steelblue">'+"Steelblue line means brushed data <br>"+'</font>'
    + '<font color="red">'+"Red line means overview data"+'</font>';

    self.svg = self.parentElement.select("svg");

    self.graphW = 500;
    self.graphH = 300;

    self.xScale = d3.scale.ordinal().rangeBands([0, self.graphW], 0.1).domain(d3.range(0, 16));
    // xScale and xAxis stays constant

    self.yScale = d3.scale.linear().range([self.graphH, 0]);


    self.xAxis = d3.svg.axis().scale(self.xScale);
    // xScale and xAxis stays constant

    self.yAxis = d3.svg.axis().scale(self.yScale).orient("left");

    // visual elements
    self.visG = self.svg.append("g").attr({
        "transform": "translate(" + 60 + "," + 10 + ")"
    });

    // xScale and xAxis stays constant:
    // copied from http://bl.ocks.org/mbostock/4403522
    self.visG.append("g")
        .attr("class", "xAxis axis")
        .attr("transform", "translate(0," + self.graphH + ")")
        .call(self.xAxis)
        .selectAll("text")
        .attr("y", 3) // magic number
        .attr("x", 10) // magic number
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start")
        .text(function (d) {
            return self.metaData.priorities[d]["item-title"];
        });

    self.visG.append("g").attr("class", "yAxis axis");

    // filter, aggregate, modify data
    self.wrangleData(null);
    
    // Store the original display data
    self.origData = [];
    self.displayData.forEach(function(d, i){
        self.origData[i] = self.displayData[i];
    });
    
    //draw the verticle grid
    
    var xGrid = self.visG.selectAll("lineX")
    .data(self.origData);
    xGrid.enter()
    .append("line")
    .attr("x1", function(d, i){
        return self.xScale(i);})
    .attr("x2", function(d, i){
        return self.xScale(i);})
    .attr("y1", 0)
    .attr("y2", self.graphH)
    .style("stroke", "#ccc");
    
    //draw the horizontal grid
    var yGrid = self.visG.selectAll("lineY")
    .data(dataSet);
    yGrid.enter()
    .append("line")
    .attr("x1", 0)
    .attr("x2", self.graphW)
    .attr("y1", function(d, i){
        return d;
    })
    .attr("y2", function(d, i){
        return d;
    })
    .style("stroke", "#ccc");

    // call the update method
    self.updateVis();
    
};


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
PrioVisCmp.prototype.wrangleData = function (_filterFunction) {
    var self = this;
    
    // displayData should hold the data which is visualized
    self.displayData = self.filterAndAggregate(_filterFunction);

};



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
PrioVisCmp.prototype.updateVis = function () {


    var self = this;

    // update the scales :
    var minMaxY = [0, d3.max(self.origData)];
    self.yScale.domain(minMaxY);
    self.yAxis.scale(self.yScale);

    // draw the scales :
    self.visG.select(".yAxis").call(self.yAxis);
    
    // draw the bars :
//    var bars = self.visG.selectAll(".bar").data(self.displayData);
//    bars.exit().remove();
//    bars.enter().append("rect")
//        .attr({
//            "class": "bar",
//            "width": self.xScale.rangeBand(),
//            "x": function (d, i) {
//                return self.xScale(i);
//            }
//        }).style({
//            "fill": function (d, i) {
//                return self.metaData.priorities[i]["item-color"];
//            }
//        });
//
//    bars.attr({
//        "height": function (d) {
//            return self.graphH - self.yScale(d) - 1;
//        },
//        "y": function (d) {
//            return self.yScale(d);
//        }
//    });
    
    //Line Chart
    //Brushed data

    var line = d3.svg.line()
     .x(function(d,i) { 
         return self.xScale(i) + self.graphW/32; })
     .y(function(d,i) {
         return self.yScale(d); })
     .interpolate("linear");
    
    var path = self.visG.selectAll(".path").data(self.displayData);
    path.exit().remove();
    path.enter()
    .append("path")
    .attr({
        "class": "path"
    })
    .style({
        "stroke": "steelblue",
        "stroke-width": 2,
        "fill": null,
        "fill-opacity": 0
    });
    path.attr("d", line(self.displayData));
    
    //Origdata
    var line = d3.svg.line()
     .x(function(d,i) { 
         return self.xScale(i) + self.graphW/32; })
     .y(function(d,i) {
         return self.yScale(d); })
     .interpolate("linear");
    
    var path = self.visG.selectAll(".OrigPath").data(self.origData);
    path.exit().remove();
    path.enter()
    .append("path")
    .attr({
        "class": "OrigPath"
    })
    .style({
        "stroke": "red",
        "stroke-width": 2,
        "fill": null,
        "fill-opacity": 0
    });
    path.attr("d", line(self.origData));
};


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
PrioVisCmp.prototype.onSelectionChange = function (selectionStart, selectionEnd) {
    var self = this;
    
    // call wrangleData with a filter function
    self.wrangleData(function (data) {
        return (data.time <= selectionEnd && data.time >= selectionStart);
    });

    self.updateVis();
};


/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */



/**
 * The aggregate function that creates the counts for each priority for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
PrioVisCmp.prototype.filterAndAggregate = function (_filter) {
    var self = this;

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;};
    if (_filter !== null){
        filter = _filter;
    }
    
    // ******* TASK 1b *******
    // Implement the function that filters the data and sums the values
    
    // create an array of values for the priorities 0-15
    var res = d3.range(0, 16).map(function () {
        return 0;
    });
    
    // accumulate all values that fulfill the filter criterion
    self.data.filter(filter).forEach(function (datum) {
//        console.log("datum");
//        console.log(datum);
        d3.range(0, 16).forEach(function (index) {
            res[index] += datum.prios[index];
        });
    });

    return res;

};