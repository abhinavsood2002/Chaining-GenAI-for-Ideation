import React, { useState } from "react"
import { Box, Button, Container, Textarea, VStack } from "@chakra-ui/react"

const CollapsibleNotepad = ({ text, setText, task }) => {
  const [isOpen, setIsOpen] = useState(true)
  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value)
  }

  return (
    <>
      <Button
        onClick={handleToggle}
        aria-label={isOpen ? "Close" : "Open"}
        position="fixed"
        top="50%"
        right={isOpen ? "400px" : "0"}
        zIndex="1"
        transform="translateY(-50%)"
        bg="gray.300"
        color="black"
        _hover={{ bg: "gray.400" }}
        transition="right 0.3s ease"
      >
        {isOpen ? "Close" : "Open"}
      </Button>
      <Box
        position="fixed"
        top="0"
        right={isOpen ? "0" : "-400px"}
        bottom="0"
        bg="blue.700"
        transition="right 0.3s ease"
        overflow="auto"
        p="4"
        w="400px"
      >
        <VStack>
          <Container bg="blue.700" color="white">
            Task: {task}
          </Container>
          <Textarea
            value={text}
            onChange={handleChange}
            rows={30}
            placeholder="Notepad for Recording Task Output and Writing Drafts..."
            w="100%"
            bg="white"
            visibility={isOpen ? "visible" : "hidden"}
          />
        </VStack>
      </Box>
    </>
  )
}

export default CollapsibleNotepad
