/*globals d3, topojson, document*/
// These are helpers for those using JSHint

var data,
    locationData,
    teamSchedules,
    selectedSeries,
    colorScale;

var startup = true;

/* EVENT RESPONSE FUNCTIONS */
function setHover(d) {
    // There are FOUR data_types that can be hovered;
    // nothing (null), a single Game, a Team, or
    // a Location
    
    // ******* TODO: PART V *******
    var textBounds = document.getElementById("info");//.getBoundingClientRect();   
    
    if(d === null)
    {
        textBounds.innerHTML = "";
        return;
    }
    
    if(d.data_type === "Team")
    {
        textBounds.innerHTML = d.name;
        return;
    }
    
    if(d.data_type === "Game")
    {
        textBounds.innerHTML = d["Visit Team Name"] + " @ " + d["Home Team Name"];
        return;
    }
    
    if(d.data_type === "Location")
    {
        var infoString = [];
        
        d.games.forEach(function (input) {
            infoString += input["Visit Team Name"] + " @ " + input["Home Team Name"] + ",";
        });
        
        if(infoString != null)
        {
            var substr = infoString.substring(0, infoString.length-1);
            
            textBounds.innerHTML = substr;
            return;
        }
        else
        {
            textBounds.innerHTML = "";
            return;
        }
    }
        
}

function clearHover() {
    setHover(null);
}

function changeSelection(d) {
    // There are FOUR data_types that can be selected;
    // an empty selection (null), a single Game,
    // a Team, or a Location.

    // ******* TODO: PART V *******
    
    // Update everything that is data-dependent
    // Note that updateBarChart() needs to come first
    // so that the color scale is set
    console.log("Enter changeSelection");
    console.log(d);
    
    if(d === null)
    {
        return;
    }
    
    if(d.data_type === "Game")
    {
        selectedSeries = [];
        selectedSeries.push(d);
        updateBarChart();
        console.log("changeSelection() output: selectedSeries");
        console.log(selectedSeries);
        return;
    }
    
    if(d.data_type === "Team")
    {
        selectedSeries = [];
        selectedSeries = teamSchedules[d.name];
        updateBarChart();
        updateMap();
        console.log("changeSelection() output: selectedSeries");
        console.log(selectedSeries);
        return;
    }
    
    if(d.data_type === "Location")
    {
        selectedSeries = [];
        selectedSeries = d.games;
        updateBarChart();
        console.log("changeSelection() output: selectedSeries");
        console.log(selectedSeries);
        return;
    }
}

/* DRAWING FUNCTIONS */

function updateBarChart() {
    var svgBounds = document.getElementById("barChart").getBoundingClientRect(),
        xAxisSize = 100,
        yAxisSize = 60;

    // ******* TODO: PART I *******
    
    // Create the x and y scales; make
    // sure to leave room for the axes
    var yData = [30000, 40000, 50000, 60000, 70000, 80000, 90000];
    
    // Use sample from http://bl.ocks.org/Caged/6476579
    var xScale = d3.scale.ordinal()
        .domain(selectedSeries.map(function(d){return d.Date;}))
        .rangeRoundBands([yAxisSize, svgBounds.width - yAxisSize], 0.1);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
    
    var yScale = d3.scale.linear()
        .domain([0, d3.max(yData, function (d) {
        return d;})])
        .range([svgBounds.height - xAxisSize, xAxisSize]);
    
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    // Create the axes (hint: use #xAxis and #yAxis)
    var xAxes = d3.select("#xAxis")
        .attr("transform", "translate(0," + (svgBounds.height - xAxisSize) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(270)")
        .attr("y", 0)
        .attr("x", -yAxisSize+5)
        .attr("dy", ".35em");
    
    var yAxes = d3.select("#yAxis")
        .attr("transform", "translate(" + yAxisSize + ",0)")
        .call(yAxis);
    
    // Create colorScale (note that colorScale
    // is global! Other functions will refer to it)
    if(startup)
    {
        colorScale = d3.scale.quantize()
                .range(["rgb(210,248,210)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"])
                .domain([
                    d3.min(selectedSeries, function(d) { return d.attendance; }),
                    d3.max(selectedSeries, function(d) { return d.attendance; })
                ]);
    }

    // Create the bars (hint: use #bars)   
    var svgBarChart = d3.selectAll("#bars").selectAll("rect")
    .data(selectedSeries);

//    console.log("updateBarChart(): selectedSeries");
//    console.log(selectedSeries);
//    console.log(svgBarChart);
    //Use the sample of lecture
    //http://dataviscourse.net/2015/lectures/lecture-d3-layouts-maps/
    svgBarChart.enter()
    .append("rect");
    svgBarChart.style("fill", function(d){
        var value = d.attendance;
//        console.log("value");
//        console.log(value);
        if(value) 
        {
            return colorScale(value);
            //return "steelblue";
        } 
        else 
        {
            return "#ccc";
        }
    })
    .attr("x", function(d){
        //console.log(d.Date);
        return xScale(d.Date);})
    .attr("y", function(d){
        //console.log(d.attendance);
        return yScale(d.attendance);})
    .attr("width", xScale.rangeBand())
    .attr("height", function(d){
        return svgBounds.height - xAxisSize - yScale(d.attendance);});
        // ******* TODO: PART IV *******

    // Make the bars respond to hover and click events
    svgBarChart.on("mouseover", function(d){setHover(d);})
    .on("mouseout", function(d){clearHover();})
    .on("click", function(d){changeSelection(d);});
    
    svgBarChart.exit().remove();

}

function updateForceDirectedGraph() {
    // ******* TODO: PART II *******
    
    // Set up the force-directed
    // layout engine
    var nodeShape = d3.svg.symbol().type(function(d){
        if(d.data_type === "Game")
        {
            return "circle";
        }
        else
        {
            return "triangle-up"
        }
        });
    
    var nodeClass = function(d){
        if(d.data_type === "Game")
        {
            return "game";
        }
        else
        {
            return "team"
        }
        };
    
    var svgGraph = document.getElementById("graph").getBoundingClientRect();
    
    // Use the link method from the sample of the lecture
    // http://dataviscourse.net/2015/lectures/lecture-d3-layouts-maps/
    var force = d3.layout.force()
            .charge(-120)
            .linkDistance(30)
            .friction(0.9)
            .gravity(0.1)
            .size([svgGraph.width, svgGraph.height]);
    
    force
        .nodes(data.vertices)
        .links(data.edges)
        .start();

    // Draw the links (hint: use #links)
    var link = d3.select("#graph").select("#links").selectAll("line")
            .data(data.edges);
    
    link.enter().append("line")
        .style("stroke", "rgb(216, 216, 216)")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });
    
    link.exit().remove();

    // Update the links based on the current selection

    // Draw the nodes (hint: use #nodes), and make them respond to dragging
    var node = d3.select("#graph").select("#nodes").selectAll("path")
            .data(data.vertices);
    
    node.enter()
        .append("path")
        .attr("d", nodeShape)
        .attr("class", nodeClass)
        // ******* TODO: PART IV *******
    
    // Make the nodes respond to hover and click events
        .on("mouseover", function(d){setHover(d);})
        .on("mouseout", function(d){clearHover();})
        .on("click", function(d){changeSelection(d);})
        .call(force.drag);

    node.exit().remove();
    
    // ******* TODO: PART V *******
    
    // Color and size the Game nodes if they are in selectedSeries
    
    // ******* TODO: PART II *******
    
    // Finally, tell the layout engine how
    // to manipulate the nodes and links
    // that we've drawn
    force.on("tick", function(){
        link.attr("x1", function(d){return d.source.x;})
            .attr("y1", function(d){return d.source.y;})
            .attr("x2", function(d){return d.target.x;})
            .attr("y2", function(d){return d.target.y;});
        
        node.attr("transform", function (d) {
            return "translate(" + d.x + ", " + d.y + ")";});
    });
}

function updateMap() {
    // ******* TODO: PART III *******
    
    // NOTE: locationData is *NOT* a Javascript Array, like
    // we'd normally use for .data() ... instead, it's just an
    // object (often called an Associative Array)!
    
    // Draw the games on the map (hint: use #points)
    console.log("Enter updateMap");

    var realData = [];
    for(property in locationData) {
        realData.push(locationData[property]);
    }
    
    console.log("realData");
    console.log(realData);
    
    var svgBounds = document.getElementById("map").getBoundingClientRect();
    
    var svgPoints = d3.select("#map")
        .attr("width", svgBounds.width)
        .attr("height", svgBounds.height)
        .selectAll("#points")
        .data(realData);
    
    var projection = d3.geo.albersUsa()
        .translate([svgBounds.width / 2, svgBounds.height / 2])
        .scale(1200);
    
    var radium = 5;
    svgPoints.enter()
        .append("circle")
        .attr("r", radium)
        .attr("transform", function(d) {return "translate(" + projection([d.longitude,d.latitude]) + ")";})
        .attr("class", "game")
        .attr("opacity", 0)
        .on("mouseover", function(d){setHover(d);})
        .on("mouseout", function(d){clearHover();})
        .on("click", function(d){changeSelection(d);});
    
    
    
    // ******* TODO: PART V *******
    
    // Update the circle appearance (set the fill to the
    // mean attendance of all selected games... if there
    // are no matching games, revert to the circle's default style)
    svgPoints.transition()
    .duration(100)
    .attr("r", function(d){
        if(startup)
        {
            return radium;
        }
        else
        {
            var flag = false;
            selectedSeries.forEach( function(input){
                if(parseFloat(d.latitude) == parseFloat(input.latitude) && parseFloat(d.longitude) == parseFloat(input.longitude))
                {
                    flag = true;
                }
            });
            if(flag)
            {
                console.log("updateMap(): Amplify");
                return radium*2;
            }
            else
            {
                console.log("updateMap(): Remain");
                return radium;
            }
        }
    })
    .attr("opacity", 1);
    
    svgPoints.exit()
        .attr("opacity", 1)
        .transition()
        .duration(100)
        .attr("opacity", 0)
        .remove();
    
    console.log("Leave updateMap");
    startup = false;
}

function drawStates(usStateData) {
    // ******* TODO: PART III *******
    
    // Draw the background (state outlines; hint: use #states)
    console.log("Enter drawStates");
    var svgBounds = document.getElementById("map").getBoundingClientRect();
    
    var svgState = d3.select("#map")
        //.attr("id", "#states")
        .attr("width", svgBounds.width)
        .attr("height", svgBounds.height);
    
    //Use the sample from http://bl.ocks.org/mbostock/4090848
    var projection = d3.geo.albersUsa()
            .translate([svgBounds.width / 2, svgBounds.height / 2])
            .scale(1200);
    
    var path = d3.geo.path()
        .projection(projection);
        
    svgState.insert("path", ".graticule")
        .datum(topojson.feature(usStateData, usStateData.objects.land))
        .attr("id", "states")
        .attr("d", path);

//    svgState.insert("path", ".graticule")
//        .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && !(a.id / 1000 ^ b.id / 1000); }))
//        .attr("id", "states")
//        .attr("d", path);

    svgState.insert("path", ".graticule")
        .datum(topojson.mesh(usStateData, usStateData.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "states")
        .attr("d", path);
    
    console.log("Leave drawStates");
}


/* DATA DERIVATION */

// You won't need to edit any of this code, but you
// definitely WILL need to read through it to
// understand how to do the assignment!

function dateComparator(a, b) {
    // Compare actual dates instead of strings!
    return Date.parse(a.Date) - Date.parse(b.Date);
}

function isObjectInArray(obj, array) {
    // With Javascript primitives (strings, numbers), you
    // can test its presence in an array with
    // array.indexOf(obj) !== -1
    
    // However, with actual objects, we need this
    // helper function:
    var i;
    for (i = 0; i < array.length; i += 1) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function deriveGraphData() {
    // Currently, each edge points to the "_id" attribute
    // of each node with "_outV" and "_inV" attributes.
    // d3.layout.force expects source and target attributes
    // that point to node index numbers.

    // This little snippet adds "source" and "target"
    // attributes to the edges:
    var indexLookup = {};
    data.vertices.forEach(function (d, i) {
        indexLookup[d._id] = i;
    });
    data.edges.forEach(function (d) {
        d.source = indexLookup[d._outV];
        d.target = indexLookup[d._inV];
    });
}

function deriveLocationData() {
    var key;

    // Obviously, lots of games are played in the same location...
    // ... but we only want one interaction target for each
    // location! In fact, when we select a location, we want to
    // know about ALL games that have been played there - which
    // is a different slice of data than what we were given. So
    // let's reshape it ourselves!

    // We're going to create a hash map, keyed by the
    // concatenated latitude / longitude strings of each game
    locationData = {};

    data.vertices.forEach(function (d) {
        // Only deal with games that have a location
        if (d.data_type === "Game" &&
            d.hasOwnProperty('latitude') &&
            d.hasOwnProperty('longitude')) {

            key = d.latitude + "," + d.longitude;

            // Each data item in our new set will be an object
            // with:

            // latitude and longitude properties,

            // a data_type property, similar to the ones in the
            // original dataset that you can use to identify
            // what type of selection the current selection is,
            
            // and a list of all the original game objects that
            // happened at this location
            
            if (!locationData.hasOwnProperty(key)) {
                locationData[key] = {
                    "latitude": d.latitude,
                    "longitude": d.longitude,
                    "data_type": "Location",
                    "games": []
                };
            }
            locationData[key].games.push(d);
        }
    });

    // Finally, let's sort each list of games by date
    for (key in locationData) {
        if (locationData.hasOwnProperty(key)) {
            locationData[key].games = locationData[key].games.sort(dateComparator);
        }
    }
}

function deriveTeamSchedules() {
    var teamName;

    // We're going to need a hash map, keyed by the
    // Name property of each team, containing a list
    // of all the games that team played, ordered by
    // date
    teamSchedules = {};

    // First pass: I'm going to sneakily iterate over
    // the *edges*... this will let me know which teams
    // are associated with which games
    data.edges.forEach(function (d) {
        // "source" always refers to a game; "target" always refers to a team
        teamName = data.vertices[d.target].name;
        if (!teamSchedules.hasOwnProperty(teamName)) {
            teamSchedules[teamName] = [];
        }
        teamSchedules[teamName].push(data.vertices[d.source]);
    });

    // Now that we've added all the game objects, we still need
    // to sort by date
    for (teamName in teamSchedules) {
        if (teamSchedules.hasOwnProperty(teamName)) {
            teamSchedules[teamName] = teamSchedules[teamName].sort(dateComparator);
        }
    }
}


/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

d3.json("data/us.json", function (error, usStateData) {
    if (error) throw error;
    console.log("Call drawStates");
    drawStates(usStateData);
    console.log("Call updateMap");
    updateMap();    
});
d3.json("data/pac12_2013.json", function (error, loadedData) {
    if (error) throw error;

    // Store the data in a global variable for all functions to access
    data = loadedData;

    // These functions help us get slices of the data in
    // different shapes
    deriveGraphData();
    deriveLocationData();
    deriveTeamSchedules();
    
    // Start off with Utah's games selected
    selectedSeries = teamSchedules.Utah;

    // Draw everything for the first time
    updateBarChart();
    updateForceDirectedGraph();
    //console.log("Call updateMap");
    //updateMap();
});