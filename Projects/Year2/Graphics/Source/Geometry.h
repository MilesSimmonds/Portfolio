#pragma once

#define ShaderFileName		L"shader.hlsl"
#define VertexShaderName	"VS"
#define PixelShaderName		"PS"

struct CBuffer
{
	Matrix		WorldViewProjection;
	Matrix		World;
	Vector4		MaterialColour;
	Vector4		AmbientLightColour;
	Vector4		DirectionalLightColour;
	Vector4		DirectionalLightVector;

};

D3D11_INPUT_ELEMENT_DESC vertexDesc[] =
{
	{ "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, 0, D3D11_INPUT_PER_VERTEX_DATA, 0 },
	{ "NORMAL", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, 12, D3D11_INPUT_PER_VERTEX_DATA, 0 },
};

