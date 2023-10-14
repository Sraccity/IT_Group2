import { TTFExp } from '../explanations';
import NTreeTracer from '../../components/DataStructures/Graph/NTreeTracer';

import VariableTreeNode from '../../components/DataStructures/Graph/NAryTreeVariable'; 
import { TravelExploreSharp } from '@mui/icons-material';


export default {
    explanation: TTFExp,
    
  
    initVisualisers() {
      return {
        tree: {
          instance: new NTreeTracer('n-tree', null, 'Tree View'),
          order: 0,
        },
      };
    },
  printTree(root){
    if (!root) {
      console.log("Tree is empty");
      return;
    }
  
    let queue = [];  // Initialize a queue
  
    // Enqueue the root with level 1
    queue.push([root, 1]);

    console.log("Tree Structure: ");
    while(queue.length > 0) {
        let levelSize = queue.length;  // Get the number of elements at this level

        let currentLine = "";
        while(levelSize > 0) {  // Process all nodes at this level
            let [currentNode, level] = queue.shift();  // Dequeue node and level

            // Append to line
            currentLine += "Level " + level + ": " + currentNode.getIDs();
            if (currentNode.parent) {
                currentLine += " (Parent: " + currentNode.parent.getIDs() + ")";
            }
            currentLine += " | ";

          // Enqueue children of the current node with level incremented
            for (let child of currentNode.children) {
                queue.push([child, level + 1]);
            }

            levelSize--;
        }

        console.log(currentLine);  // Print the current line
    }
  },
  findChild(child, value){
    // if it's a 2-node

    if (child === null){
      return null;
    }
    if (child.getNodeLength() === 1){
      if (value < child.getIDs()[0])
        return child.children[0];
      else{
        return child.children[1];
      }
    }
    // if it's a 3-node
    else if(child.getNodeLength()==2){
      
      if (value < child.getIDs()[0]){
        return child.children[0];
      }
      
      else if (value < child.getIDs()[1]){
        return child.children[1];
      }
      else{
        return child.children[2];
      }

    }
    // if i's a 4-node
    else{
      if (value< child.getIDs()[0]){
        return child.children[0];
      }
      else if(value < child.getIDs()[1]){
        return child.children[1];
      }
      else if(value < child.getIDs()[2]){
        return child.children[2];
      }
      else{
        return child.children[3];
      }
    }
  
  },

  traverseAndInsert(chunker, value, tree, newID){
    // this function will aim to find the node where to insert the value
    // making sure to expand any 4-nodes on the way
    let parent = null;
    let child = tree;

    while (child!= null){
      // check if it's a 4 node
      if (child.getNodeLength() === 3){
        // so it's a 4 node, so we must split it
        // give new children new IDs, but keep same ID for the new parent formed
        let child1 = new VariableTreeNode(newID);
        newID = newID + 1;
        let child2 = new VariableTreeNode(newID);
        newID = newID +1;
        //console.log("value", value);
        //console.log("child", child.getIDs());
        if (child.children.length > 0){
          child1.children.push(child.children[0]);
        }
        if (child.children.length > 1){
          child2.children.push(child.children[1]);
        }
        if (child.children.length > 2){
          child1.children.push(child.children[2]);
        }
        if (child.children.length>3){
          child2.children.push(child.children[3]);
        }
        
        
       
        child1.addRelatedNodeID(child.getIDs()[0]);
        child2.addRelatedNodeID(child.getIDs()[2]);
       
        // now after the split has been done, we form the new parent
        if (parent === null){
          // this means we are at top of tree, so must form new root
          tree = new VariableTreeNode(newID);
          
          newID = newID + 1;
          tree.children.push(child1);
          tree.children.push(child2);
          tree.addRelatedNodeID(child.getIDs()[1]);
          // controller; internal logic for the 2-3-4 tree
          chunker.add(
            '1',
            (vis, newParentID, parentValue, oldChildID, child1Info, child2Info) => {
              console.log("before is this happening :/",vis.tree.nodes, vis.tree.realNodes)
              console.log("edges b efore is this happening :/",vis.tree.edges, vis.tree.realEdges)

              vis.tree.addVariableNode(newParentID, parentValue);
              
              vis.tree.addEdge(0, newParentID);
              //console.log("lul", JSON.stringify(vis.tree.realEdges), JSON.stringify(vis.tree.realNodes));
              
              // remove old child
              
              vis.tree.removeFullNode(oldChildID);
              console.log("cry",oldChildID);
              
              //console.log("lul2", JSON.stringify(vis.tree.realEdges), JSON.stringify(vis.tree.realNodes));
              // add child1 and child2 which are new now to the tree
              
              vis.tree.addVariableNode(child1Info[0], child1Info[1]);
              vis.tree.addVariableNode(child2Info[0], child2Info[1]);
              

              // now connect them properly to new parent and also the original children
              vis.tree.addEdge(newParentID, child1Info[0]);
              vis.tree.addEdge(newParentID, child2Info[0]);
              for (let i =0; i < child2Info[2].length; i ++){
                vis.tree.addEdge(child2Info[0], child2Info[2][i].id);
              }
              for (let i =0; i < child1Info[2].length; i ++){
                vis.tree.addEdge(child1Info[0], child1Info[2][i].id);

              }
              console.log("why is this happening :/",vis.tree.nodes, vis.tree.realNodes)
              console.log("edges after is this happening :/",vis.tree.edges, vis.tree.realEdges)

              vis.tree.layout();

            
            },[tree.id, tree.getIDs()[0],child.id,[child1.id, child1.getIDs()[0], child1.children], [child2.id, child2.getIDs()[0], child2.children]]
          );
          child = tree;
        }
        else if (parent.getNodeLength()===1){
          // parent is a 2-node
          if (parent.children[0] === child){
            // make parent a 3 node
            let parentChildren = parent.children;
            let parentnodeIDs = parent.getIDs();
            parent.clearRelatedNodeIDs();
            parent.children = [child1, child2, parentChildren[1]];
            parent.addRelatedNodeID(child.getIDs()[1]);
            parent.addRelatedNodeID(parentnodeIDs[0]);
            
          }
          else{
            // make parent a 3 node
            
            let parentChildren = parent.children;
            let parentnodeIDs = parent.getIDs();
            parent.clearRelatedNodeIDs();

            parent.children = [parentChildren[0], child1, child2];
            
            parent.addRelatedNodeID(parentnodeIDs[0]);
            parent.addRelatedNodeID(child.getIDs()[1]);
          }
          chunker.add(
            '1',
            (vis, ParentID,newParentValue, oldChildID , child1Info, child2Info) => {
              
              
              
              // remove old child
              vis.tree.removeFullNode(oldChildID);
              // add child1 and child2 which are new now to the tree
              
              vis.tree.addVariableNode(child1Info[0], child1Info[1]);
              vis.tree.addVariableNode(child2Info[0], child2Info[1]);
              //add to parent as well
              vis.tree.addVariableNode(ParentID, newParentValue);

              // now connect them properly to new parent and also the original children
              vis.tree.addEdge(ParentID, child1Info[0]);
              vis.tree.addEdge(ParentID, child2Info[0]);
              for (let i =0; i < child2Info[2].length; i ++){
                vis.tree.addEdge(child2Info[0], child2Info[2][i].id);
              }
              for (let i =0; i < child1Info[2].length; i ++){
                vis.tree.addEdge(child1Info[0], child1Info[2][i].id);
              }
              //console.log("real edges", vis.tree.realEdges, vis.tree.realNodes)
              vis.tree.layout();
              
            },[tree.id, child.getIDs()[1], child.id, [child1.id, child1.getIDs()[0], child1.children], [child2.id, child2.getIDs()[0], child2.children]]);

        }
        else{
          if (parent.children[0] === child){
            // make parent into a 4 node
            let parentChildren = parent.children;
            let parentnodeIDs = parent.getIDs();
            parent.clearRelatedNodeIDs();

            parent.children = [child1, child2, parentChildren[1], parentChildren[2]];
            parent.addRelatedNodeID(child.getIDs()[1]);
            parent.addRelatedNodeID(parentnodeIDs[0]);
            parent.addRelatedNodeID(parentnodeIDs[1]);
          }
          else if(parent.children[1] === child){
            let parentChildren = parent.children;
            let parentnodeIDs = parent.getIDs();
            parent.clearRelatedNodeIDs();

            parent.children = [parentChildren[0], child1, child2, parentChildren[2]];
            parent.addRelatedNodeID(parentnodeIDs[0]);
            parent.addRelatedNodeID(child.getIDs()[1]);
            parent.addRelatedNodeID(parentnodeIDs[1]);

          }
          else{
            let parentChildren = parent.children;
            let parentnodeIDs = parent.getIDs();
            parent.clearRelatedNodeIDs();

            parent.children = [parentChildren[0], parentChildren[1], child1, child2];
            parent.addRelatedNodeID(parentnodeIDs[0]);
            parent.addRelatedNodeID(parentnodeIDs[1]);
            parent.addRelatedNodeID(child.getIDs()[1]);

          }
          chunker.add(
            '1',
            (vis, ParentID,newParentValue, oldChildID , child1Info, child2Info) => {
              
              
              // remove old child
              vis.tree.removeFullNode(oldChildID);
              // add child1 and child2 which are new now to the tree
              
              vis.tree.addVariableNode(child1Info[0], child1Info[1]);
              vis.tree.addVariableNode(child2Info[0], child2Info[1]);
              //add to parent as well
              vis.tree.addVariableNode(ParentID, newParentValue);

              // now connect them properly to new parent and also the original children
              vis.tree.addEdge(ParentID, child1Info[0]);
              vis.tree.addEdge(ParentID, child2Info[0]);
              for (let i =0; i < child2Info[2].length; i ++){
                vis.tree.addEdge(child2Info[0], child2Info[2][i].id);
              }
              for (let i =0; i < child1Info[2].length; i ++){
                vis.tree.addEdge(child1Info[0], child1Info[2][i].id);
              }
              vis.tree.layout();
              
            },[tree.id, child.getIDs()[1], child.id, [child1.id, child1.getIDs()[0], child1.children], [child2.id, child2.getIDs()[0], child2.children]]);
          
        }
        if (value< child.getIDs()[1]){
          child = child1;
        }
        else{
          child = child2;
        }
        

      }
      parent = child;
      child = this.findChild(child, value);
      
      
        
      
    }
    // time to insert now, as we have exited the loop    
    parent.addRelatedNodeID(value);
    chunker.add(
      '1',
      (vis, id, value) => {
        
        vis.tree.addVariableNode(id, value);
        
        vis.tree.layout();
        
      },[parent.id, value]
    );
    return {nTree: tree, id: newID};


  },
  insert(chunker, value, tree, newID){
    // this function allows the insertion of a node into the tree
    // note we assume here that the tree is not empty, as we precreate it
    let newInfo = this.traverseAndInsert(chunker, value, tree, newID);
    
    return newInfo

  },
    /**
   *
   * @param {object} chunker
   * @param {array} nodes array of numbers needs to be inserted
   */
  run(chunker, { ignore }) {
    const nodes = [5, 3, 7, 2, 4, 6, 8, 1, 9, 10];
    // could chuck the initial root logic into insert as well tbf
    let tree = null;
    let newID = 1;
    tree = new VariableTreeNode(newID);
    newID = newID + 1;
    tree.addRelatedNodeID(1);
    chunker.add(
      '1',
      (vis, nodeID, value) => {
        vis.tree.variableNodes = true;
        vis.tree.isDirected = false;
        vis.tree.addVariableNode(0, '0');
        vis.tree.addVariableNode(nodeID, value);
        vis.tree.addEdge(0, nodeID);
        console.log(vis.tree.nodes);
        vis.tree.layout();
    
      },[tree.id, tree.getIDs()[0]]
    );
    
    let treeStruct = this.insert(chunker, 2, tree, newID);
    treeStruct = this.insert(chunker,3, treeStruct["nTree"], treeStruct["id"]);
    treeStruct = this.insert(chunker, 4,treeStruct["nTree"], treeStruct["id"] );
    treeStruct = this.insert(chunker, 5,treeStruct["nTree"], treeStruct["id"] );
    this.printTree(treeStruct["nTree"]);
    treeStruct = this.insert(chunker, 6 ,treeStruct["nTree"], treeStruct["id"] );
    treeStruct = this.insert(chunker, 7 ,treeStruct["nTree"], treeStruct["id"] );
    treeStruct = this.insert(chunker, 8,treeStruct["nTree"], treeStruct["id"] );
    treeStruct = this.insert(chunker, 9,treeStruct["nTree"], treeStruct["id"] );
    //treeStruct = this.insert(chunker, 10,treeStruct["nTree"], treeStruct["id"] );

    //this.printTree(treeStruct["nTree"]);
    //treeStruct = this.insert(chunker, 21 ,treeStruct["nTree"], treeStruct["id"] );
    //this.printTree(treeStruct["nTree"]);
    //treeStruct = this.insert(chunker, 16 ,treeStruct["nTree"], treeStruct["id"] );
    //this.printTree(treeStruct["nTree"]);

    //console.log("jinja", JSON.stringify(treeStruct[]) )
    

    
   


  },



};

