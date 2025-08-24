#pragma once
#include "CubeNode.h"
#include "Geometry.h"


//INITIALISE
bool CubeNode::Initialise(){
    if (FAILED(CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED)))
    {
        return false;
    }
    _device = DirectXFramework::GetDXFramework()->GetDevice();
    _deviceContext = DirectXFramework::GetDXFramework()->GetDeviceContext();
    if (_device.Get() == nullptr || _deviceContext.Get() == nullptr) {
        return false;
    }
    
    //IF THERE IS A SPHERE PRESENT BUILD THE SPHERE  
    if (_shape == "sphere")
        ComputeSphere(vertices, indices, 2.0f, 100);
   
    //IF THERE IS A CONE PRESENT BUILD THE CONE 
    else if (_shape == "cone")
        ComputeCone(vertices, indices, 3.0f, 3.0f, 100);
   
    //ELSE BUILD THE BOX
    else
    ComputeBox(vertices, indices, Vector3(2));
    CalculateVertexNormals();
    BuildGeometry();
    BuildShaders();
    BuildVertexLayout();
    BuildConstantBuffer();
    return true;
}
    //RENDER
void CubeNode::Render() {
    
    Matrix projectionTransformation = DirectXFramework::GetDXFramework()->GetProjectionTransformation();
    Matrix viewTransformation = DirectXFramework::GetDXFramework()->GetViewTransformation();
 

    CBuffer constantBuffer;
    //CALCULATE COMPLETE TRANSFORMATION
    Matrix completeTransformation = _cumulativeWorldTransformation * viewTransformation * projectionTransformation;
    constantBuffer.WorldViewProjection = completeTransformation;
    constantBuffer.MaterialColour = _materialColour;
    //AMBIENT LIGHT COLOUR
    constantBuffer.AmbientLightColour = Vector4(0.5f, 0.5f, 0.5f, 1.0f);
    constantBuffer.World = _cumulativeWorldTransformation;
    constantBuffer.DirectionalLightVector = Vector4(-1.0f, -1.0f, 1.0f, 0.0f);
   //DIRECTIONAL LIGHT COLOUR 
    constantBuffer.DirectionalLightColour = Vector4(Colors::White);
    _deviceContext->VSSetConstantBuffers(0, 1, _constantBuffer.GetAddressOf());
    _deviceContext->UpdateSubresource(_constantBuffer.Get(), 0, 0, &constantBuffer, 0, 0);
    _deviceContext->PSSetShaderResources(0, 1, _texture.GetAddressOf());
    UINT stride = sizeof(ObjectVertexStruct);
    UINT offset = 0;
    _deviceContext->IASetVertexBuffers(0, 1, _vertexBuffer.GetAddressOf(), &stride, &offset);
    _deviceContext->IASetIndexBuffer(_indexBuffer.Get(), DXGI_FORMAT_R32_UINT, 0);
    _deviceContext->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
    _deviceContext->IASetInputLayout(_layout.Get());
    _deviceContext->VSSetShader(_vertexShader.Get(), 0, 0);
    _deviceContext->PSSetShader(_pixelShader.Get(), 0, 0);
    _deviceContext->DrawIndexed((UINT)indices.size(),0,0);
}
//BUILD GEOMETRY 
void CubeNode::BuildGeometry() {
    D3D11_BUFFER_DESC vertexBufferDescriptor = { 0 };
    vertexBufferDescriptor.Usage = D3D11_USAGE_IMMUTABLE;
    vertexBufferDescriptor.ByteWidth = static_cast<UINT>(sizeof(ObjectVertexStruct) * vertices.size());
    vertexBufferDescriptor.BindFlags = D3D11_BIND_VERTEX_BUFFER;
    vertexBufferDescriptor.CPUAccessFlags = 0;
    vertexBufferDescriptor.MiscFlags = 0;
    vertexBufferDescriptor.StructureByteStride = 0;
    D3D11_SUBRESOURCE_DATA vertexInitialisationData = { 0 };
    vertexInitialisationData.pSysMem = &vertices[0];
    ThrowIfFailed(_device->CreateBuffer(&vertexBufferDescriptor, &vertexInitialisationData, _vertexBuffer.GetAddressOf()));
    D3D11_BUFFER_DESC indexBufferDescriptor = { 0 };
    indexBufferDescriptor.Usage = D3D11_USAGE_IMMUTABLE;
    indexBufferDescriptor.ByteWidth = static_cast<UINT>(sizeof(UINT) * indices.size());
    indexBufferDescriptor.BindFlags = D3D11_BIND_INDEX_BUFFER;
    indexBufferDescriptor.CPUAccessFlags = 0;
    indexBufferDescriptor.MiscFlags = 0;
    indexBufferDescriptor.StructureByteStride = 0;
    D3D11_SUBRESOURCE_DATA indexInitialisationData;
    indexInitialisationData.pSysMem = &indices[0];
    ThrowIfFailed(_device->CreateBuffer(&indexBufferDescriptor, &indexInitialisationData, _indexBuffer.GetAddressOf()));
}

void CubeNode::BuildVertexLayout() {
    ThrowIfFailed(_device->CreateInputLayout(vertexDesc, ARRAYSIZE(vertexDesc), _vertexShaderByteCode->GetBufferPointer(), _vertexShaderByteCode->GetBufferSize(), _layout.GetAddressOf()));
}

//BUILD THE SHADERS 
void CubeNode::BuildShaders()
{
    DWORD shaderCompileFlags = 0;
#if defined( _DEBUG )
    shaderCompileFlags = D3DCOMPILE_DEBUG | D3DCOMPILE_SKIP_OPTIMIZATION;
#endif

    ComPtr<ID3DBlob> compilationMessages = nullptr;
    HRESULT hr = D3DCompileFromFile(ShaderFileName,
        nullptr, D3D_COMPILE_STANDARD_FILE_INCLUDE,
        VertexShaderName, "vs_5_0",
        shaderCompileFlags, 0,
        _vertexShaderByteCode.GetAddressOf(),
        compilationMessages.GetAddressOf());

    if (compilationMessages.Get() != nullptr)
    {
        MessageBoxA(0, (char*)compilationMessages->GetBufferPointer(), 0, 0);
    }
    ThrowIfFailed(hr);
    ThrowIfFailed(_device->CreateVertexShader(_vertexShaderByteCode->GetBufferPointer(), _vertexShaderByteCode->GetBufferSize(), NULL, _vertexShader.GetAddressOf()));
    hr = D3DCompileFromFile(ShaderFileName,
        nullptr, D3D_COMPILE_STANDARD_FILE_INCLUDE,
        PixelShaderName, "ps_5_0",
        shaderCompileFlags, 0,
        _pixelShaderByteCode.GetAddressOf(),
        compilationMessages.GetAddressOf());
    if (compilationMessages.Get() != nullptr)
    {
        MessageBoxA(0, (char*)compilationMessages->GetBufferPointer(), 0, 0);
    }
    ThrowIfFailed(hr);
    ThrowIfFailed(_device->CreatePixelShader(_pixelShaderByteCode->GetBufferPointer(), _pixelShaderByteCode->GetBufferSize(), NULL, _pixelShader.GetAddressOf()));


}
//CONSTANT BUFFERS 
void CubeNode::BuildConstantBuffer() {
    D3D11_BUFFER_DESC bufferDesc;
    ZeroMemory(&bufferDesc, sizeof(bufferDesc));
    bufferDesc.Usage = D3D11_USAGE_DEFAULT;
    bufferDesc.ByteWidth = sizeof(CBuffer);
    bufferDesc.BindFlags = D3D11_BIND_CONSTANT_BUFFER;

    ThrowIfFailed(_device->CreateBuffer(&bufferDesc, NULL, _constantBuffer.GetAddressOf()));
}
//CALCULATE VERTEX NORMALS 
void CubeNode::CalculateVertexNormals()
{
    //CREATE ARRAY TO COUNT TRIANGLES IN EACH VERTEX
    std :: vector <int> contributingCounts (vertices.size(),0);
    //LOOP THROUGH THE INDICIES IN THREES
    for (size_t i = 0; i < indices.size(); i += 3)
    {
        //THE INDICIES FOR THE CURRENT TRAIANGLE 
        int index0 = indices[i];
        int index1 = indices[i + 1];
        int index2 = indices[i + 2];


        //GET THE POSITION OF THE VERTICIES FOR CURRENT TRIANGLE
        Vector3 vertex0 = vertices[index0].Position;
        Vector3 vertex1 = vertices[index1].Position;
        Vector3 vertex2 = vertices[index2].Position;
        
        //CALCULATE THE VECTORS
        Vector3 x = vertex1 - vertex0;
        Vector3 y = vertex2 - vertex0;
        
        //CALCULATE THE CROSS PRODUCT
        Vector3 normal = x.Cross(y);

        //ADD THE UNNORMALIZED NORMAL
        vertices[index0].Normal += normal;
        vertices[index1].Normal += normal;
        vertices[index2].Normal += normal;

        //INCREMENT THE COUNT 
        contributingCounts[index0]++;
        contributingCounts[index1]++;
        contributingCounts[index2]++;
    }

    //NORMALIZE THE NORMALS 
    for (size_t i = 0; i < vertices.size(); ++i)
    {
        //NORMALIZE THE RESULTING NORMAL
        if (contributingCounts[i] > 0)
        {
            vertices[i].Normal /= static_cast<float>(contributingCounts[i]);
        }
        vertices[i].Normal.Normalize();

    }
}


