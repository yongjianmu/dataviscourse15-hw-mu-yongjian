/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)


function staircase() {
    // ****** TODO: PART II ******
    console.log("Enter starecase()");
    var firstbar=document.getElementById("firstbar");
    var rects=firstbar.getElementsByTagName("rect");
    var temp_height;
    
    for(var i=0; i<rects.length-1; i++)
    {
        for(var j=0; j<rects.length-1-i; j++)
        {
            if(parseFloat(rects.item(j+1).getAttribute("height")) < parseFloat(rects.item(j).getAttribute("height")))
            {
                temp_height=rects.item(j).getAttribute("height");
                rects.item(j).setAttribute("height", rects.item(j+1).getAttribute("height"));
                rects.item(j+1).setAttribute("height", temp_height);
            }
        }
    }
    
    //Test
    //for(var i=0; i<rects.length; i++)
    //{
    //    console.log("Rect["+i+"] height: "+ rects.item(i).getAttribute("height"));
    //}
    console.log("Leave starecase()");
}

var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset(function(d){return[parseFloat(d.a)+"px", parseFloat(d.b)+"px"];})
    .style("position", "absolute")
    //.offset([0+"px",-400+"px"])
    .html(function(d) {
        return "<strong>cx= </strong> <span style='color:red'>" + d.a + "</span> <strong>cy= </strong> <span style='color:red'>" + d.b + "</span>";
    });

var startup = true;
function update(error, data) {
    console.log("Enter update(), data length: "+data.length);
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a);
            d.b = parseFloat(d.b);
        });
    }

    // Set up the scales
    var aScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 13]);
    var bScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 13]);
    var iScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, 13]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars
    var firstbar = d3.select("#firstbar");
    var first_rects = firstbar.selectAll("rect").data(data);
    
    if(!startup)
    {
        console.log("Append data");
        first_rects.enter().append("rect")
            .attr("x", function(d, i){return i;})
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", function(d, i){return aScale(d.a);})
            .attr("opacity", 0)
            .style("stroke", "black")
            .style("stroke-width", 0.1)
            .style("fill", "blue");
        
        first_rects.transition()
            .duration(1000)
            .attr("x", function(d, i){return i;})
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", function(d, i){return aScale(d.a);})
            .style("stroke", "black")
            .style("stroke-width", 0.1)
            .style("fill", "blue")
            .attr("opacity", 1);
        
        first_rects.exit()
            .attr("opacity", 1)
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();
    }
    else
    {
        first_rects.data(data);
        first_rects.attr("height", function(d, i){return aScale(d.a);});
    }

    // TODO: Select and update the 'b' bar chart bars
//    var secondbar = d3.select("#secondbar");
//    var second_rects = secondbar.selectAll("rect")
//    .data(data)
//    .attr("height", function(d, i){return bScale(d.b);});
    var secondbar = d3.select("#secondbar");
    var second_rects = secondbar.selectAll("rect").data(data);
    
    if(!startup)
    {
        console.log("Append data");
        second_rects.enter().append("rect")
            .attr("x", function(d, i){return i;})
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", function(d, i){return bScale(d.b);})
            .attr("opacity", 0)
            .style("stroke", "black")
            .style("stroke", 0.1)
            .style("fill", "blue");
        
        second_rects.transition()
            .duration(1000)
            .attr("x", function(d, i){return i;})
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", function(d, i){return aScale(d.b);})
            .style("stroke", "black")
            .style("stroke", 0.1)
            .style("fill", "blue")
            .attr("opacity", 1);
        
        second_rects.exit()
            .attr("opacity", 1)
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();
    }
    else
    {
        second_rects.data(data);
        second_rects.attr("height", function(d, i){return aScale(d.b);});
    }

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.svg.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });
    
    var firstline = d3.select("#firstline");
    var first_lines = firstline.selectAll("line");
    first_lines.remove();
    
    var first_paths = firstline.selectAll("path");
    first_paths.remove();
    firstline.append("path")
    .style("fill", "none")
    .style("stroke", "blue")
    .style("stroke-width", 0.1)
    .attr("d", aLineGenerator(data));
    //console.log(firstline);
    

    // TODO: Select and update the 'b' line chart path (create your own generator)
    var bLineGenerator = d3.svg.line()
    .x(function (d, i) {
        return iScale(i);
    })
    .y(function (d) {
        return bScale(d.b);
    });
    
    var secondline = d3.select("#secondline");
    var second_lines = secondline.selectAll("line");
    second_lines.remove();
    var second_paths = secondline.selectAll("path");
    second_paths.remove();
    secondline.append("path")
    .style("fill", "none")
    .style("stroke", "blue")
    .style("stroke-width", 0.1)
    .attr("d", bLineGenerator(data));
    //console.log(secondline);

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.svg.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    var first_area = d3.select("#firstarea");
    var first_polygon = first_area.selectAll("polygon");
    first_polygon.remove();
    var first_polygon_path = first_area.selectAll("path");
    first_polygon_path.remove();
    first_area.append("path")
    .style("fill", "blue")
    .style("stroke", "blue")
    .style("stroke-width", 0.1)
    .attr("d", aAreaGenerator(data));
    
    // TODO: Select and update the 'b' area chart path (create your own generator)
        var bAreaGenerator = d3.svg.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.b);
        });

    var second_area = d3.select("#secondarea");
    var second_polygon = second_area.selectAll("polygon");
    second_polygon.remove();
    var second_polygon_path = second_area.selectAll("path");
    second_polygon_path.remove();
    second_area.append("path")
    .style("fill", "blue")
    .style("stroke", "blue")
    .style("stroke-width", 0.1)
    .attr("d", bAreaGenerator(data));

    // TODO: Select and update the scatterplot points
    // ****** TODO: PART IV ******
    var first_scatterplot = d3.select("#firstscatterplot");
    var first_circles = first_scatterplot.selectAll("circle").data(data);
  
    if(!startup)
    {
        console.log("Append data");
        first_circles.enter().append("circle")
            .attr("cx", function(d, i){return aScale(d.a);})
            .attr("cy", function(d, i){return aScale(d.b);})
            .attr("r", 0.15)
            .attr("opacity", 0)
            .style("stroke", "blue")
            .style("stroke-width", 0.1)
            .style("fill", "blue");
        
        first_circles.transition()
            .duration(1000)
            .attr("x", function(d, i){return i;})
            .attr("y", 0)
            .attr("width", 1)
            .attr("cx", function(d, i){return aScale(d.a);})
            .attr("cy", function(d, i){return aScale(d.b);})
            .style("stroke", "blue")
            .style("stroke-width", 0.1)
            .style("fill", "blue")
            .attr("opacity", 1);
        
        first_circles.exit()
            .attr("opacity", 1)
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();
    }
    else
    {
        first_circles.attr("cx", function(d, i){return aScale(d.a);})
        .attr("cy", function(d, i){return aScale(d.b);});        
    }
    first_circles.on("click", function(d,i){console.log("Response Click Circle: "+"cx="+d.a+" cy="+d.b)})
        .call(tip)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);
    
    
    startup = false;
    console.log("Leave update()");
}

function changeData() {
    console.log("Enter changeData()");
    // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    console.log("Load data: "+dataFile);
    d3.csv('data/' + dataFile + '.csv', update);
    console.log("Leave changeData()");
}

function randomSubset() {
    console.log("Enter randomSubset()");
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    d3.csv('data/' + dataFile + '.csv', function (error, data) {
        var subset = [];
        data.forEach(function (d) {
            if (Math.random() > 0.5) {
                subset.push(d);
            }
        });
        console.log("subset");
        console.log(subset);
        update(error, subset);
    });
    console.log("Leave randomSubset()");
}

function changeColor(element) {
    console.log("Enter changeColor()");
    var rects=element.getElementsByTagName("rect");
    for(var i=0; i<rects.length; i++)
    {
        rects.item(i).setAttribute("fill", "green");
    }
    console.log("Leave changeColor()");
}

function restoreColor(element) {
    console.log("Enter changeColor()");
    var rects=element.getElementsByTagName("rect");
    for(var i=0; i<rects.length; i++)
    {
        rects.item(i).setAttribute("fill", "blue");
    }
    console.log("Leave changeColor()");
}