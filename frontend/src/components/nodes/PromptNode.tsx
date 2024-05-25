import {
  Box,
  Center,
  Textarea,
  StackDivider,
  VStack,
  Button,
  HStack,
  Spinner,
  Tooltip,
} from "@chakra-ui/react"
import React, { useEffect } from "react"
import { Handle, Position } from "reactflow"
import useStore from "../../store"
import { runPromptNode } from "../../library/runNodes"
import StandardNodeHeader from "./StandardNodeHeader"
import "../../css/handle.css"

function PromptNode({ id, data, isConnectable }) {
  const reactFlowState = useStore()
  const [prompt, setPrompt] = React.useState("")
  const [promptText, setPromptText] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [temperature, setTemperature] = React.useState(0)
  const [outputLength, setOutputLength] = React.useState("very short")

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
      <Tooltip label="Connect to pass Prompt">
        <Handle
          className="handle"
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{ position: "absolute", top: "50%", background: "orange" }}
        />
      </Tooltip>
      <Tooltip label="Output">
        <Handle
          className="handle"
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ position: "absolute", top: "80%", background: "red" }}
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
            divider={<StackDivider w="100%" borderColor="gray.700" />}
            spacing={2}
            style={{ whiteSpace: "pre-wrap" }}
            w="100%"
          >
            <Box w="100%">Prompt Node</Box>
            <StandardNodeHeader
              data={data}
              onClick={() => runPromptNode(id)}
              temperature={temperature}
              outputLength={outputLength}
              handleUpdateState={handleUpdateFromAdvancedMenu}
              setTemperature={setTemperature}
              setOutputLength={setOutputLength}
            />

            <VStack spacing={0} w="100%">
              <Textarea
                value={prompt}
                onChange={handleInputChange}
                placeholder="Enter a prompt to generate output:"
                w="95%"
              />
              <Box w="100%">
                Additional text added to prompt:{" "}
                {promptText && "\n" + promptText}
              </Box>
            </VStack>

            <Box w="100%">Output: {"\n" + output}</Box>
          </VStack>
        </Center>
      </Box>
    </div>
  )
}

export default PromptNode
