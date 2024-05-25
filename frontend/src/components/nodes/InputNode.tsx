/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Center,
  Textarea,
  StackDivider,
  VStack,
  HStack,
  Text,
  Tooltip,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  IconButton,
} from "@chakra-ui/react"
import React, { useEffect, useRef, useState } from "react"
import { Handle, Position } from "reactflow"
import useStore from "../../store"
import "../../css/handle.css"
import autosize from "autosize"
import { FaEye } from "react-icons/fa"

function InputNode({ id, data, isConnectable }) {
  const reactFlowState = useStore()
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const currentNode = reactFlowState.getNode(id)
    if (currentNode && currentNode.data) {
      setInput(currentNode.data.output)
    }
  }, [])
  const handleOpenModal = () => {
    setIsOpen(true)
  }
  const handleCloseModal = () => {
    setIsOpen(false)
  }
  const handleInputChange = (e) => {
    let inputValue = e.target.value
    setInput(inputValue)
    reactFlowState.updateNodeData(id, { output: inputValue })
  }
  const ref = useRef()
  useEffect(() => {
    autosize(ref.current)
    return () => {
      autosize.destroy(ref.current)
    }
  }, [])

  return (
    <div>
      <Tooltip label="Output">
        <Handle
          className="handle"
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ position: "absolute", top: "50%", background: "red" }}
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
            margin={1}
          >
            <HStack spacing={10} margin={1}>
              <Box>Input</Box>
              <Tooltip label="Expand details" aria-label="Expand details">
                <IconButton
                  colorScheme="blue"
                  onClick={handleOpenModal}
                  h="25px"
                  w="20px"
                  aria-label={""}
                  icon={<FaEye />}
                />
              </Tooltip>
            </HStack>
            <Textarea
              value={input}
              size="sm"
              onChange={handleInputChange}
              placeholder="Enter some text input"
              w="100%"
              ref={ref}
              style={{ width: "350px" }}
            />
          </VStack>
        </Center>
      </Box>
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xxl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Node Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box overflowY="auto" style={{ whiteSpace: "pre-wrap" }}>
              {Object.entries(data)
                .filter(([key, value]) => key !== "running" && value !== "")
                .map(([key, value]) => (
                  <Box key={key}>
                    <Text as="h4" fontSize="xl" fontWeight="bold" mb="2">
                      {key}
                    </Text>
                    {typeof value === "string" || typeof value === "number" ? (
                      <Text>{value}</Text>
                    ) : (
                      <>
                        {console.log(data)}
                        <img src={(value as { src: string }).src} alt={key} />
                      </>
                    )}
                  </Box>
                ))}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default InputNode
