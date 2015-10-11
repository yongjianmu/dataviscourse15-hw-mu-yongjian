# Answers for Questions

### Q2a
The area selected by the brush represents the interactive area, which will inflect ages and priorities charts.
Type: path, Class: area. 

Other inflected elements:
1) Age Distribution, Type: path, Class: area

2) Priorities Distribution, Type: rectangle, Class: bar

### Q2b
The brush type:
d3.svg.brush

The brush contains three rectangles:
1. The center of the brush, which used to measure the range of the brush.
Type: rect, Class: extent.

2. The left edge of the brush, which is used to measure the left boundary.
Type: rect, Class: resize w.

3. The right edge of the brush, which is used to measure the right boundary.
Type: rect, Class: resize e.


### Q2c
The brush represents the votes of the date range of loaded file.
1) Date
Type: Json data(Date), Class: xAxis axis.

2) Votes
Type: path, Class: area

Other inflected elements:
1) Age Distribution, Type: path, Class: area

2) Priorities Distribution, Type: rectangle, Class: bar
