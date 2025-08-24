// CONSTANT BUFFER DECLARATION
cbuffer ConstantBuffer
{
    // TRANSFORMATION MATRICES
matrix worldViewProjection;
matrix World;

    // MATERIAL PROPERTIES
float4 materialColour;

    // LIGHTING PROPERTIES
float4 ambientLightColour;
float4 DirectionalLightColour;
float4 DirectionalLightVector;
};

// INPUT STRUCTURE FOR VERTEX SHADER
struct VertexIn
{
    float3 InputPosition : POSITION;
    float3 Normal : NORMAL;
};

// OUTPUT STRUCTURE FROM VERTEX SHADER
struct VertexOut
{
    float4 OutputPosition : SV_POSITION;
    float4 Colour : COLOR;
};

// VERTEX SHADER FUNCTION
VertexOut VS(VertexIn vin)
{
    VertexOut vout;

    // TRANSFORM INPUT POSITION TO SCREEN SPACE
    vout.OutputPosition = mul(worldViewProjection, float4(vin.InputPosition, 1.0f));

    // ADJUST NORMAL IN WORLD SPACE
    float4 adjustedNormal = mul(World, float4(vin.Normal, 0.0f));

    // CALCULATE DIFFUSE LIGHT
    float diffuseLight = saturate(dot(adjustedNormal, -DirectionalLightVector));

    // CALCULATE FINAL COLOR WITH LIGHTING AND MATERIAL PROPERTIES
    float4 lightTotal = saturate(diffuseLight * DirectionalLightColour + ambientLightColour);
    vout.Colour = lightTotal * materialColour;

    return vout;
}

// PIXEL SHADER FUNCTION
float4 PS(VertexOut pin) : SV_Target
{
    // OUTPUT FINAL COLOR
    return pin.Colour;
}
