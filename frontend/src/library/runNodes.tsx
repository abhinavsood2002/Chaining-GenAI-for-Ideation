import useStore from "../store"
import { Node } from "reactflow"

function getUserId() {
  return localStorage.getItem("userId") || ""
}

function topologicalSort(nodes, edges) {
  const inDegree = {} // Map to store in-degree of each node
  const adjacencyList = {} // Map to store the adjacency list (edges)

  // Initialize in-degree for each node and adjacency list
  nodes.forEach((node) => {
    inDegree[node.id] = 0
    adjacencyList[node.id] = []
  })

  edges.forEach((edge) => {
    const source: string = edge.source
    const target: string = edge.target
    adjacencyList[source].push(target) // Store edges in adjacency list
    inDegree[target] += 1 // Increment in-degree of target node
  })
  const queue = nodes.filter((node) => inDegree[node.id] === 0) // Enqueue nodes with in-degree 0
  const result: Node[] = [] // Array to store the result (topological ordering)

  // Perform BFS
  while (queue.length > 0) {
    queue.sort((a, b) => {
      return a.position.x - b.position.x
    })
    const currentNode: Node = queue.shift() // Dequeue a node
    result.push(currentNode) // Add node to the result

    adjacencyList[currentNode.id].forEach((neighbor) => {
      inDegree[neighbor] -= 1 // Decrement in-degree of connected nodes
      if (inDegree[neighbor] === 0) {
        queue.push(nodes.find((node) => node.id === neighbor)) // If in-degree becomes 0, add it to the queue
      }
    })
  }

  return result
}

export const runChainNode = async (id) => {
  try {
    const reactFlowState = useStore.getState()
    const nodeToRun = reactFlowState.getNode(id)
    reactFlowState.updateNodeData(id, { running: true })

    const inputEdges = reactFlowState.getEdges("", id)
    let concatenatedInput = ""
    let concatenatedPrompt = ""

    for (const inputEdge of inputEdges) {
      // Differentiate between "input" and "prompt" edges
      if (inputEdge.targetHandle === "input") {
        const inputNodeId = inputEdge.source
        const inputNode = reactFlowState.getNode(inputNodeId)
        const input = inputNode ? inputNode.data.output : ""
        concatenatedInput += "\n" + input // Add an empty line between inputs
      } else {
        const inputNodeId = inputEdge.source
        const inputNode = reactFlowState.getNode(inputNodeId)
        const prompt = inputNode ? inputNode.data.output : ""
        concatenatedPrompt += "\n" + prompt // Add an empty line between inputs
      }
    }

    // Preventing trailing linespace instead, remove the extra one at the start
    concatenatedInput = concatenatedInput.substring(1)
    concatenatedPrompt = concatenatedPrompt.substring(1)

    const promptText =
      concatenatedPrompt === ""
        ? nodeToRun.data.prompt === ""
          ? ""
          : nodeToRun.data.prompt
        : nodeToRun.data.prompt === ""
          ? concatenatedPrompt
          : nodeToRun.data.prompt + "\n" + concatenatedPrompt
    const promptToPass = encodeURIComponent(promptText)
    const inputToPass = encodeURIComponent(concatenatedInput)
    const temperatureToPass = encodeURIComponent(nodeToRun.data.temperature)
    const lengthToPass = encodeURIComponent(nodeToRun.data.outputLength)
    const userId = encodeURIComponent(getUserId())
    const apiUrl =
      `${process.env.REACT_APP_API_URL}/api/run/chain_node?` +
      `prompt=${promptToPass}` +
      `&input=${inputToPass}` +
      `&temperature=${temperatureToPass}` +
      `&length=${lengthToPass}` +
      `&userid=${userId}`

    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    const result = await response.json()
    reactFlowState.updateNodeData(id, {
      prompt: nodeToRun.data.prompt,
      promptInput: concatenatedPrompt,
      input: concatenatedInput,
      output: result.output,
      running: false,
    })
  } catch (error) {
    console.error("Error running node:", error)
    // Handle error, throw, or log it as per your application's requirement
  }
}
export const runTextToImage = async (id) => {
  const reactFlowState = useStore.getState()
  const nodeToRun = reactFlowState.getNode(id)
  reactFlowState.updateNodeData(id, { running: true })

  const inputEdges = reactFlowState.getEdges("", id)
  let concatenatedPrompt = ""
  for (const inputEdge of inputEdges) {
    const inputNodeId = inputEdge.source
    const inputNode = reactFlowState.getNode(inputNodeId)
    const prompt = inputNode ? inputNode.data.output : ""
    concatenatedPrompt += "\n" + prompt // Add an empty line between inputs
  }
  concatenatedPrompt = concatenatedPrompt.substring(1)
  const promptText =
    concatenatedPrompt === ""
      ? nodeToRun.data.prompt === ""
        ? ""
        : nodeToRun.data.prompt
      : nodeToRun.data.prompt === ""
        ? concatenatedPrompt
        : nodeToRun.data.prompt + "\n" + concatenatedPrompt
  const promptToPass = encodeURIComponent(promptText)
  const userId = encodeURIComponent(getUserId())
  const apiUrl =
    `${process.env.REACT_APP_API_URL}/api/run/txt_to_img_node?` +
    `prompt=${promptToPass}` +
    `&userid=${userId}`

  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  const image = await response.blob()
  const imageURL = URL.createObjectURL(image)
  reactFlowState.updateNodeData(id, {
    prompt: nodeToRun.data.prompt,
    promptInput: concatenatedPrompt,
    image: imageURL,
    running: false,
  })
}

export const runPromptNode = async (id) => {
  try {
    const reactFlowState = useStore.getState()
    const nodeToRun = reactFlowState.getNode(id)
    reactFlowState.updateNodeData(id, { running: true })

    const inputEdges = reactFlowState.getEdges("", id)
    let concatenatedPrompt = ""
    for (const inputEdge of inputEdges) {
      const inputNodeId = inputEdge.source
      const inputNode = reactFlowState.getNode(inputNodeId)
      const prompt = inputNode ? inputNode.data.output : ""
      concatenatedPrompt += "\n" + prompt // Add an empty line between inputs
    }
    concatenatedPrompt = concatenatedPrompt.substring(1)
    const promptText =
      concatenatedPrompt === ""
        ? nodeToRun.data.prompt === ""
          ? ""
          : nodeToRun.data.prompt
        : nodeToRun.data.prompt === ""
          ? concatenatedPrompt
          : nodeToRun.data.prompt + "\n" + concatenatedPrompt
    const temperatureToPass = encodeURIComponent(nodeToRun.data.temperature)
    const lengthToPass = encodeURIComponent(nodeToRun.data.outputLength)
    const promptToPass = encodeURIComponent(promptText)
    const userId = encodeURIComponent(getUserId())
    const apiUrl =
      `${process.env.REACT_APP_API_URL}/api/run/prompt_node?` +
      `prompt=${promptToPass}` +
      `&temperature=${temperatureToPass}` +
      `&length=${lengthToPass}` +
      `&userid=${userId}`

    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    const result = await response.json()
    reactFlowState.updateNodeData(id, {
      prompt: nodeToRun.data.prompt,
      promptInput: concatenatedPrompt,
      output: result.output,
      running: false,
    })
  } catch (error) {
    console.error("Error running node:", error)
    // Handle error, throw, or log it as per your application's requirement
  }
}

async function logRunStart() {
  const userId = encodeURIComponent(getUserId())
  const apiUrl = `${process.env.REACT_APP_API_URL}/api/run/start?userid=${userId}`
  const response = await fetch(apiUrl)
  if (!response.ok) {
    console.error("Failed to log run start")
  }
}

async function logRunEnd() {
  const userId = encodeURIComponent(getUserId())
  const apiUrl = `${process.env.REACT_APP_API_URL}/api/run/end?userid=${userId}`
  const response = await fetch(apiUrl)
  if (!response.ok) {
    console.error("Failed to log run end")
  }
}

export const runNodes = async () => {
  const reactFlowState = useStore.getState()
  const nodes = reactFlowState.nodes
  const edges = reactFlowState.edges
  await logRunStart()
  const runOrder = topologicalSort(nodes, edges)
  let progress = 0
  reactFlowState.setProgress(1)
  for (const node of runOrder) {
    // Update Progress to cause an update that shows progress bar and disables run button.
    if (node.type === "chain_node") {
      await runChainNode(node.id)
    } else if (node.type === "prompt_node") {
      await runPromptNode(node.id)
    } else if (node.type === "txt_to_img") {
      await runTextToImage(node.id)
    }
    progress++
    reactFlowState.setProgress((progress / runOrder.length) * 100)
  }
  reactFlowState.setProgress(0)
  await logRunEnd()
}

// export const runNodeFactory = async (nodeType) => {
//   if (nodeType === "chain_node") {
//     return runChainNode;
//   }
// }
