#pragma once
#include "DirectXApp.h"
#include "CubeNode.h"


DirectXApp app;


float _rotationAngle;

void DirectXApp::CreateSceneGraph()
{
    SceneGraphPointer sceneGraph = GetSceneGraph();

    //MAIN CUBE
    shared_ptr<CubeNode> cube = make_shared<CubeNode>(L"mainCube", Vector4(Colors::Chocolate));
    cube->SetWorldTransform(Matrix::CreateScale(Vector3(5.0f, 5.0f, 5.0f)) * Matrix::CreateTranslation(Vector3(-30, 20, 0)));
    sceneGraph->Add(cube);

    //SECOND CUBE
    cube = make_shared<CubeNode>(L"secondCube", Vector4(Colors::Pink));
    cube->SetWorldTransform(Matrix::CreateScale(Vector3(5.0f, 5.0f,5.0f)) * Matrix::CreateTranslation(Vector3(-10, 20, 0)));
    sceneGraph->Add(cube);

  
    //CONE
    cube = make_shared<CubeNode>(L"cone", Vector4(Colors::Yellow),"cone");
    cube->SetWorldTransform(Matrix::CreateScale(Vector3(3.0f, 3.0f, 3.0f)) * Matrix::CreateTranslation(Vector3(30, 20, 0)));
    sceneGraph->Add(cube);

    //SPHERE
    cube = make_shared<CubeNode>(L"ball", Vector4(Colors::Purple), "sphere");
    cube->SetWorldTransform(Matrix::CreateScale(Vector3(4.0f, 4.0f, 4.0f)) * Matrix::CreateTranslation(Vector3(10,20, 0)));
    sceneGraph->Add(cube);

    
    
}


void DirectXApp::UpdateSceneGraph()
{
    SceneGraphPointer sceneGraph = GetSceneGraph();
    _rotationAngle += 0.8f;

    // SCENE GRAPH TRANSFORMATION 
    sceneGraph->SetWorldTransform(Matrix::CreateRotationY(_rotationAngle * XM_PI / 180.0f));
    
}

