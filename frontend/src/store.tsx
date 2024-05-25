import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow"
import { create } from "zustand"

type DeleteNode = (node_id: string) => void
type DuplicateNode = (node_id: string) => void
type DeleteEdge = (edge_id: string) => void
type SetNodes = (nodes: Node[]) => void
type SetEdges = (edges: Edge[]) => void
type UpdateNodeData = (node_id: string, newData: Object) => void
type GetNode = (node_id: string) => Node
type GetEdges = (source?: string, target?: string) => Edge[]
type DeleteAllNodes = () => void
type SetProgress = (number) => void
export type RFState = {
  progress: number
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  setNodes: SetNodes
  setEdges: SetEdges
  getNode: GetNode
  getEdges: GetEdges
  updateNodeData: UpdateNodeData
  deleteNode: DeleteNode
  deleteEdge: DeleteEdge
  duplicateNode: DuplicateNode
  deleteAllNodes: DeleteAllNodes
  setProgress: SetProgress
}

const useStore = create<RFState>((set, get) => ({
  progress: 0,
  nodes: [],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  setNodes: (nodes: Node[]) => {
    set({
      nodes: nodes,
    })
  },

  setEdges: (edges: Edge[]) => {
    set({
      edges: edges,
    })
  },

  // Function to get a node by ID
  getNode: (node_id: string) => {
    const nodes = get().nodes // Get the current nodes state
    return nodes.find((node) => node.id === node_id) // Find the node by ID
  },

  getEdges: (source: string = "", target: string = "") => {
    const edges = get().edges // Get the current edges state

    if (source && target) {
      return edges.filter(
        (edge) => edge.source === source && edge.target === target,
      )
    } else if (source) {
      return edges.filter((edge) => edge.source === source)
    } else if (target) {
      return edges.filter((edge) => edge.target === target)
    } else {
      return []
    }
  },

  updateNodeData: (node_id: string, newData: Object) => {
    set((state) => {
      const updatedData = state.nodes.map((node) => {
        if (node.id === node_id) {
          return { ...node, data: { ...node.data, ...newData } }
        }
        return node
      })
      return { nodes: updatedData }
    })
  },

  deleteNode: (node_id: string) => {
    const this_node = get().nodes.find((node) => node.id === node_id)
    if (this_node.type === "group") {
      const childrenToRemove = get().nodes.filter(
        (node) => node.parentNode === node_id,
      )
      console.log(childrenToRemove.length)
      if (childrenToRemove.length > 0) {
        alert(
          "Please remove all children nodes (nodes within the rectangle) before deleting a grouping. Doing otherwise will result in an error",
        )
      } else {
        set({
          nodes: get().nodes.filter((node) => node.id !== node_id),
          edges: get().edges.filter((edge) => edge.source !== node_id),
        })
      }
    } else {
      set({
        nodes: get().nodes.filter((node) => node.id !== node_id),
        edges: get().edges.filter((edge) => edge.source !== node_id),
      })
    }
  },

  deleteAllNodes: () => {
    set({ nodes: [], edges: [] })
  },

  deleteEdge: (edge_id: string) => {
    set({
      edges: get().edges.filter((edge) => edge.id !== edge_id),
    })
  },

  duplicateNode: (node_id: string) => {
    console.log(node_id)
    console.log(get().nodes)

    const [node] = get().nodes.filter((node) => node.id === node_id)
    console.log(node)
    const new_position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    }
    const newNode = {
      id: `${node.id}-copy`,
      type: node.type,
      data: node.data,
      position: new_position,
    }

    set({
      nodes: [...get().nodes, newNode],
    })
  },
  setProgress: (newProgress: number) => {
    set({
      progress: newProgress,
    })
  },
}))

export default useStore
