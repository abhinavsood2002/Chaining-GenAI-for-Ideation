import {
  Box,
  Center,
  Textarea,
  StackDivider,
  VStack,
  Tooltip,
} from "@chakra-ui/react"
import React, { useEffect } from "react"
import { Handle, Position } from "reactflow"
import useStore from "../../store"
import { runChainNode } from "../../library/runNodes"
import "../../css/handle.css"
import StandardNodeHeader from "./StandardNodeHeader"

function ChainNode({ id, data, isConnectable }) {
  const reactFlowState = useStore()
  const [prompt, setPrompt] = React.useState("")
  const [promptText, setPromptText] = React.useState("")
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [temperature, setTemperature] = React.useState(0)
  const [outputLength, setOutputLength] = React.useState("very short")

  // If loading from a template need to load data correctly for correct display
  useEffect(() => {
    if (!data.outputLength) {
      reactFlowState.updateNodeData(id, {
        temperature: temperature,
        outputLength: outputLength,
      })
    } else {
      setTemperature(data.temperature)
      setOutputLength(data.outputLength)
    }
  }, [])

  useEffect(() => {
    const currentNode = reactFlowState.getNode(id)

    if (currentNode && currentNode.data) {
      setPrompt(currentNode.data.prompt)
      setPromptText(currentNode.data.promptInput)
      setInput(currentNode.data.input)
      setOutput(currentNode.data.output)
    }
  }, [reactFlowState, id])

  const handleInputChange = (e) => {
    let inputValue = e.target.value
    setPrompt(inputValue)
    reactFlowState.updateNodeData(id, { prompt: inputValue })
  }

  const handleUpdateFromAdvancedMenu = () => {
    reactFlowState.updateNodeData(id, {
      temperature: temperature,
      outputLength: outputLength,
    })
  }

  return (
    <div>
      <Tooltip label="Connect to pass a Prompt">
        <Handle
          className="handle"
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{ position: "absolute", top: "40%", background: "orange" }}
          id="prompt"
        />
      </Tooltip>

      <Tooltip label="Connect to pass an Input">
        <Handle
          className="handle"
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{ position: "absolute", top: "70%", background: "green" }}
          id="input"
        />
      </Tooltip>

      <Tooltip label="Output">
        <Handle
          className="handle"
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ position: "absolute", top: "90%", background: "red" }}
        />
      </Tooltip>

      <Box
        maxW="sm"
        border="1px"
        borderColor="gray.700"
        borderRadius="10px"
        shadow="lg"
        bg="white"
        w="100%"
      >
        <Center>
          <VStack
            divider={<StackDivider borderColor="gray.700" />}
            spacing={2}
            style={{ whiteSpace: "pre-wrap" }}
            w="100%"
          >
            <Box w="100%">Prompt with Context Node</Box>

            <StandardNodeHeader
              data={data}
              onClick={() => runChainNode(id)}
              temperature={temperature}
              outputLength={outputLength}
              handleUpdateState={handleUpdateFromAdvancedMenu}
              setTemperature={setTemperature}
              setOutputLength={setOutputLength}
            />
            <VStack w="100%" spacing={0}>
              <Textarea
                value={prompt}
                onChange={handleInputChange}
                placeholder="Enter a prompt to Transform your input"
                w="95%"
              />
              <Box w="100%">
                Additional text added to prompt:{" "}
                {promptText && "\n" + promptText}
              </Box>
            </VStack>

            <Box w="100%">Input: {"\n" + input}</Box>
            <Box w="100%">Output: {"\n" + output}</Box>
          </VStack>
        </Center>
      </Box>
    </div>
  )
}

export default ChainNode
