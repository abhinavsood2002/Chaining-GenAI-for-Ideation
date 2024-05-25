import {
  Text,
  Box,
  Button,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tooltip,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Radio,
  RadioGroup,
} from "@chakra-ui/react"
import { FaEye, FaPlay, FaEllipsisV } from "react-icons/fa"
import React, { useState } from "react"

const OutputLengthOptions = ["very short", "short", "medium", "long"]

export default function StandardNodeHeader({
  data,
  onClick,
  temperature = undefined,
  outputLength = undefined,
  handleUpdateState = undefined,
  setTemperature = undefined,
  setOutputLength = undefined,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenAdvancedMenu, setIsOpenAdvancedMenu] = useState(false)

  const handleOpenModal = () => {
    setIsOpen(true)
  }
  const handleCloseModal = () => {
    setIsOpen(false)
  }
  const handleOpenAdvanced = () => {
    setIsOpenAdvancedMenu(true)
  }
  const handleCloseAdvanced = () => {
    setIsOpenAdvancedMenu(false)
    handleUpdateState()
  }
  const handleOutputLengthChange = (value) => {
    setOutputLength(value)
  }
  const handleTemperatureChange = (value) => {
    setTemperature(value)
  }
  return (
    <div>
      <HStack spacing={6} margin={3} marginLeft={2}>
        <Box>Prompt</Box>
        <Box>
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
        </Box>
        <Box>
          <Button
            colorScheme="blue"
            onClick={onClick}
            h="25px"
            w="70px"
            leftIcon={<FaPlay />}
          >
            Run
          </Button>
        </Box>
        {handleUpdateState && setTemperature && setOutputLength && (
          <Box>
            <Tooltip label="Advanced options" aria-label="Advanced options">
              <Button
                colorScheme="blue"
                onClick={handleOpenAdvanced}
                h="25px"
                w="80px"
                aria-label="Advanced options"
                leftIcon={<FaEllipsisV />}
              >
                Options
              </Button>
            </Tooltip>
            <Modal
              isOpen={isOpenAdvancedMenu}
              onClose={handleCloseAdvanced}
              size="xl"
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Advanced Options</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>Temperature (Randomness): {temperature} </Text>

                  <Slider
                    aria-label="temperature"
                    defaultValue={0}
                    value={temperature}
                    min={0}
                    max={2}
                    step={0.1}
                    onChange={handleTemperatureChange}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text>Output Length</Text>
                  <RadioGroup
                    defaultValue={outputLength}
                    onChange={handleOutputLengthChange}
                  >
                    <HStack spacing="24px">
                      {OutputLengthOptions.map((option, index) => (
                        <Radio key={index} value={option}>
                          {option}
                        </Radio>
                      ))}
                    </HStack>
                  </RadioGroup>
                </ModalBody>
              </ModalContent>
            </Modal>
          </Box>
        )}
        <Box>{data.running && <Spinner />}</Box>
      </HStack>
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
