#include "SceneGraph.h"

// INITIALIZE THE SCENEGRAPH AND CALL THE INITIALIZE FUNCTION FOR EACH CHILD
bool SceneGraph::Initialise()
{
    for (const auto& child : _children)
    {
        // IF INITIALIZATION FAILS FOR ANY CHILD, RETURN FALSE
        if (!child->Initialise())
        {
            return false;
        }
    }

    // ALL CHILDREN INITIALIZED SUCCESSFULLY
    return true;
}

// UPDATE THE SCENEGRAPH AND CALL THE UPDATE FUNCTION FOR EACH CHILD WITH THE CUMULATIVE WORLD TRANSFORMATION
void SceneGraph::Update(const Matrix& worldTransformation)
{
    // CALL THE BASE CLASS UPDATE FUNCTION
    SceneNode::Update(worldTransformation);

    // UPDATE EACH CHILD WITH THE CUMULATIVE WORLD TRANSFORMATION
    for (SceneNodePointer& child : _children)
    {
        child->Update(_cumulativeWorldTransformation);
    }
}

// RENDER EACH CHILD IN THE SCENEGRAPH
void SceneGraph::Render()
{
    for (auto& child : _children)
    {
        child->Render();
    }
}

// SHUTDOWN THE SCENEGRAPH AND CALL THE SHUTDOWN FUNCTION FOR EACH CHILD
void SceneGraph::Shutdown()
{
    for (auto& child : _children)
    {
        child->Shutdown();
    }
}

// ADD A CHILD NODE TO THE SCENEGRAPH
void SceneGraph::Add(SceneNodePointer node)
{
    _children.push_back(node);
}

// REMOVE A CHILD NODE FROM THE SCENEGRAPH
void SceneGraph::Remove(SceneNodePointer node)
{
    // USE THE ERASE-REMOVE IDIOM TO REMOVE THE SPECIFIED NODE
    auto it = std::remove(_children.begin(), _children.end(), node);
    _children.erase(it, _children.end());
}

// FIND A NODE IN THE SCENEGRAPH WITH A SPECIFIED NAME
SceneNodePointer SceneGraph::Find(wstring name)
{
    // CHECK IF THE CURRENT NODE HAS THE SPECIFIED NAME
    if (_name == name)
    {
        return shared_from_this();  // RETURN SHARED POINTER TO THE CURRENT NODE
    }

    // RECURSIVELY SEARCH FOR THE NODE WITH THE SPECIFIED NAME IN EACH CHILD
    for (const auto& child : _children)
    {
        SceneNodePointer foundNode = child->Find(name);
        if (foundNode)
        {
            return foundNode;  // RETURN THE FOUND NODE
        }
    }

    // NODE WITH THE SPECIFIED NAME NOT FOUND
    return nullptr;
}
