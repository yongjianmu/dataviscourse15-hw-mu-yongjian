varying vec3 worldSpaceCoords;
varying vec4 projectedCoords;
uniform sampler2D tex, cubeTex, transferTex;
uniform float steps;
uniform float alphaCorrection;
uniform vec3 origin;
const int MAX_STEPS = 512;

//Acts like a texture3D using Z slices and trilinear filtering.
float sampleAs3DTexture( vec3 texCoord )
{
    vec4 colorSlice1, colorSlice2;
    vec2 texCoordSlice1, texCoordSlice2;

    //The z coordinate determines which Z slice we have to look for.
    //Z slice number goes from 0 to 255.
    float zSliceNumber1 = floor(texCoord.z  * 255.0);

    //As we use trilinear we go the next Z slice.
    float zSliceNumber2 = min( zSliceNumber1 + 1.0, 255.0); //Clamp to 255

    //The Z slices are stored in a matrix of 16x16 of Z slices.
    //The original UV coordinates have to be rescaled by the tile numbers in each row and column.
    texCoord.xy /= 16.0;

    texCoordSlice1 = texCoordSlice2 = texCoord.xy;

    //Add an offset to the original UV coordinates depending on the row and column number.
    texCoordSlice1.x += (mod(zSliceNumber1, 16.0 ) / 16.0);
    texCoordSlice1.y += floor((255.0 - zSliceNumber1) / 16.0) / 16.0;

    texCoordSlice2.x += (mod(zSliceNumber2, 16.0 ) / 16.0);
    texCoordSlice2.y += floor((255.0 - zSliceNumber2) / 16.0) / 16.0;

    //Get the opacity value from the 2D texture.
    //Bilinear filtering is done at each texture2D by default.
    colorSlice1 = texture2D( cubeTex, texCoordSlice1 );
    colorSlice2 = texture2D( cubeTex, texCoordSlice2 );

    float zDifference = mod(texCoord.z * 255.0, 1.0);
		float v = mix(colorSlice1.a, colorSlice2.a, zDifference);
		return v;
}

vec4 classify(float value)
{
		return texture2D( transferTex, vec2( value, 1.0) ).rgba;
}

void main( void ) {

    // ******* Your solution here! *******

    //Transform the coordinates it from [-1;1] to [0;1]
    vec2 texc = vec2(((projectedCoords.x / projectedCoords.w) + 1.0 ) / 2.0,
                    ((projectedCoords.y / projectedCoords.w) + 1.0 ) / 2.0 );

    //The back position is the world space position stored in the texture.
    vec3 backPos = texture2D(tex, texc).xyz;

    //The front position is the world space position of the second render pass.
    vec3 frontPos = worldSpaceCoords;

    //The direction from the front position to back position.
    vec3 dir = backPos - frontPos;
    float rayLength = length(dir);

    //refercence code: https://github.com/lebarba/WebGLVolumeRendering
    //Calculate how long to increment in each step.
    float delta = 1.0 / steps;

    //The increment in each direction for each step.
    vec3 deltaDirection = normalize(dir) * delta;
    float deltaDirectionLength = length(deltaDirection);

    //Start the ray casting from the front position.
    vec3 currentPosition = frontPos;

    //The color accumulator.
    vec4 accumulatedColor = vec4(0.0);

    //The alpha value accumulated so far.
    float accumulatedAlpha = 0.0;

    //How long has the ray travelled so far.
    float accumulatedLength = 0.0;

    vec4 colorSample;
    float alphaSample;

    //Perform the ray marching iterations
    for(int i = 0; i < MAX_STEPS; i++)
    {
        //Get the voxel intensity value from the 3D texture.
        colorSample = classify(sampleAs3DTexture( currentPosition ));

        //Allow the alpha correction customization
        alphaSample = colorSample.a * alphaCorrection;

        //Perform the composition.
        accumulatedColor += (1.0 - accumulatedAlpha) * colorSample * alphaSample;

        //Store the alpha accumulated so far.
        accumulatedAlpha += alphaSample;

        //Advance the ray.
        currentPosition += deltaDirection;
        accumulatedLength += deltaDirectionLength;

        //If the length traversed is more than the ray length, or if the alpha accumulated reaches 1.0 then exit.
        if(accumulatedLength >= rayLength || accumulatedAlpha >= 1.0 )
            break;
    }

    gl_FragColor  = accumulatedColor;


}
