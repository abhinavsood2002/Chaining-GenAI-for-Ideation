import React, { useState, useRef, useCallback, useEffect } from "react"
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Connection,
  Edge,
  Background,
  MiniMap,
} from "reactflow"
import { getNodesBounds } from "reactflow"
import "reactflow/dist/style.css"
import "../../css/main.css"
import Sidebar from "./Sidebar"
import { Button, Progress, useDisclosure } from "@chakra-ui/react"
import ContextMenu from "./ContextMenu"
import useStore from "../../store"
import { nanoid } from "nanoid"
import { runNodes } from "../../library/runNodes"
import { FaPlay, FaSave, FaTrash, FaCheck } from "react-icons/fa"
import { NodeTypes, nodeMinimapColors } from "../../states/NodeTypes"
import CollapsibleNotepad from "./Notepad"
import DeletionAlert from "./DeletionAlert"
import { useNavigate } from "react-router-dom"
import SubmissionAlert from "./SubmissionAlert"
import {
  fetchUserOrders,
  fetchUserTasks,
  getTaskString,
} from "../../library/userInfo"
const FlowComponent = () => {
  const reactFlowWrapper = useRef(null)
  const reactFlowState = useStore()
  const [task_output, setTaskOutput] = useState<string>("")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const submit = useDisclosure()
  const cancelRef = React.useRef()
  const cancelRef2 = React.useRef()
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [menu, setMenu] = useState(null)
  const ref = useRef(null)
  const [taskString, setTaskString] = useState("")
  const navigate = useNavigate()

  async function initialSetup() {
    const userId = localStorage.getItem("userId")
    const orders = await fetchUserOrders(userId)
    const task = await fetchUserTasks(userId)
    const taskString = getTaskString("1", orders, task)
    setTaskString(taskString)
  }

  useEffect(() => {
    initialSetup()
  }, [])

  const handleRunClick = async () => {
    console.log("Running...")
    await runNodes()
  }

  const handleSubmit = async () => {
    const userid = localStorage.getItem("userId")
    if (!userid) {
      console.error("User ID not found in local storage")
      return
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/submit1?userid=${userid}&task_output=${task_output}`,
        {
          method: "POST",
        },
      )

      const result = await response.json()
      if (result.status === "success") {
        console.log("Submission successful:", result.message)
      } else {
        console.error("Submission failed:", result.message)
      }
    } catch (error) {
      console.error("Submission error:", error)
    }
  }

  const handleSave = () => {
    const fileData = {
      nodes: reactFlowState.nodes,
      edges: reactFlowState.edges,
    }
    const blob = new Blob([JSON.stringify(fileData)], {
      type: "application/json",
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "rename_node.json"
    link.click()
  }

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      reactFlowState.setEdges(addEdge(params, reactFlowState.edges)),
    [reactFlowState.edges, reactFlowState.setEdges],
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      if (type === "template") {
        const jsonStringData = event.dataTransfer.getData("application/json")
        const { nodes: nodes_before_filter, edges } = JSON.parse(jsonStringData)
        const nodes = nodes_before_filter.filter(
          (node) => node.type !== "group",
        )
        // Reparameterize custom node ids so that duplicates can be added to flow
        const idMapping = {}

        const maxX = nodes.reduce(
          (max, node) => Math.min(max, node.position.x),
          Infinity,
        )
        const maxY = nodes.reduce(
          (max, node) => Math.min(max, node.position.y),
          Infinity,
        )
        const reparameterizedNodes = nodes.map((node) => {
          const newId = nanoid()
          const newPosition = {
            x: node.position.x - maxX + position.x,
            y: node.position.y - maxY + position.y,
          }

          idMapping[node.id] = newId
          return {
            ...node,
            id: newId,
            parentNode: "",
            position: newPosition,
            data: { ...node.data, running: false },
          }
        })

        const reparameterizedEdges = edges.map((edge) => ({
          ...edge,
          id: nanoid(),
          source: idMapping[edge.source],
          target: idMapping[edge.target],
          zIndex: 1001,
        }))

        const bounds = getNodesBounds(reparameterizedNodes)
        console.log(bounds)

        reactFlowState.setNodes(
          reactFlowState.nodes.concat(reparameterizedNodes),
        )
        reactFlowState.setEdges(
          reactFlowState.edges.concat(reparameterizedEdges),
        )
      } else {
        const newNode = {
          id: nanoid(),
          type,
          position,
          data: { input: "", output: "", prompt: "", running: false },
        }
        reactFlowState.setNodes(reactFlowState.nodes.concat(newNode))
      }
    },
    [
      reactFlowInstance,
      reactFlowState.nodes,
      reactFlowState.setNodes,
      reactFlowState.setEdges,
    ],
  )

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault()

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect()
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      })
    },
    [setMenu],
  )
  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu])

  const onEdgeDoubleClick = useCallback(
    (event, edge) => {
      event.preventDefault()
      reactFlowState.deleteEdge(edge.id)
    },
    [reactFlowState.deleteEdge],
  )

  return (
    <div className="flow-container">
      <ReactFlowProvider>
        <div
          className="reactflow-wrapper"
          ref={reactFlowWrapper}
          style={{ height: "100vh", width: "100vw" }}
        >
          <ReactFlow
            ref={ref}
            nodes={reactFlowState.nodes}
            edges={reactFlowState.edges}
            onNodesChange={reactFlowState.onNodesChange}
            onEdgesChange={reactFlowState.onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            onDoubleClick={onPaneClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            nodeTypes={NodeTypes}
            minZoom={0.001}
          >
            <Background />
            {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
            <Controls position="bottom-right" />
            <MiniMap
              nodeColor={nodeMinimapColors}
              position="bottom-center"
              zoomable={true}
              pannable={true}
            />

            {reactFlowState.progress !== 0 && (
              <Progress value={reactFlowState.progress} hasStripe />
            )}
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      <Button
        leftIcon={<FaTrash />}
        colorScheme="red"
        onClick={onOpen}
        className="delete-button"
      >
        Delete All Nodes
      </Button>
      <Button
        leftIcon={<FaPlay />}
        colorScheme="blue"
        isDisabled={reactFlowState.progress !== 0}
        onClick={handleRunClick}
        className="run-button"
      >
        Run
      </Button>
      <Button
        leftIcon={<FaSave />}
        colorScheme="teal"
        onClick={handleSave}
        className="save-button"
      >
        Save
      </Button>
      <Button
        leftIcon={<FaCheck />}
        colorScheme="green"
        onClick={submit.onOpen}
        className="submit-button"
      >
        Submit
      </Button>
      <Sidebar />
      <CollapsibleNotepad
        text={task_output}
        setText={setTaskOutput}
        task={taskString}
      />
      <DeletionAlert
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        cancelRef={cancelRef}
        onClickYes={reactFlowState.deleteAllNodes}
      />
      <SubmissionAlert
        isOpen={submit.isOpen}
        onClose={submit.onClose}
        onOpen={submit.onOpen}
        cancelRef={cancelRef2}
        onClickYes={async () => {
          handleSubmit()
          if ((await fetchUserOrders(localStorage.getItem("userId"))) === "1") {
            navigate("/chat")
          } else {
            navigate("/form")
          }
        }}
        text={task_output}
      />
    </div>
  )
}

export default FlowComponent
