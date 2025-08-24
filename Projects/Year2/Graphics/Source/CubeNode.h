
#pragma once

#include "SceneNode.h"
#include "DirectXFramework.h"
#include "GeometricObject.h"

// CubeNode class inherits from SceneNode
class CubeNode : public SceneNode
{
public: 
    // CONSTRUCTORS FOR CUBENODE WITH DIFFERENT PARAMETERS
    CubeNode(wstring name) : CubeNode(name, Vector4(0.25f, 0.25f, 0.25f, 1.0f)) {};
    CubeNode(wstring name, const Vector4 materialColour) : SceneNode(name) { _materialColour = materialColour; }
    CubeNode(wstring name, const Vector4 materialColour, string shape) : SceneNode(name), _materialColour(materialColour), _shape(shape) {};

    // VIRTUAL FUNCTION OVERRIDES
    virtual bool Initialise();
    virtual void Render();

protected:
    // DIRECT3D RESOURCES
    ComPtr<ID3D11Device>            _device;
    ComPtr<ID3D11DeviceContext>     _deviceContext;
    ComPtr<ID3D11ShaderResourceView> _texture;
    ComPtr<ID3D11Buffer>            _vertexBuffer;
    ComPtr<ID3D11Buffer>            _indexBuffer;
    ComPtr<ID3DBlob>                _vertexShaderByteCode = nullptr;
    ComPtr<ID3DBlob>                _pixelShaderByteCode = nullptr;
    ComPtr<ID3D11VertexShader>      _vertexShader2;
    ComPtr<ID3D11PixelShader>       _pixelShader2;
    ComPtr<ID3D11VertexShader>      _vertexShader;
    ComPtr<ID3D11PixelShader>       _pixelShader;
    ComPtr<ID3D11InputLayout>       _layout;
    ComPtr<ID3D11Buffer>            _constantBuffer;

    // MATERIAL PROPERTIES
    Vector4                         _materialColour;

    // VERTEX AND INDEX DATA
    vector<ObjectVertexStruct>      vertices;
    vector<UINT>                    indices;

    // SHAPE IDENTIFIER
    string                          _shape;

    // FUNCTION TO CALCULATE VERTEX NORMALS
    void CalculateVertexNormals();

    // FUNCTIONS TO BUILD AND INITIALIZE GEOMETRY, SHADERS, AND CONSTANT BUFFER
    void BuildGeometry();
    void BuildVertexLayout();
    void BuildShaders();
    void BuildConstantBuffer();
};
