import React, { useState } from "react"
import { Box, Container, Textarea } from "@chakra-ui/react"

const Notepad = ({ text, setText, task }) => {
  const [isOpen, setIsOpen] = useState(true)

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value)
  }

  return (
    <Box bg="#A0AEC0" p={2} w="full" h="full">
      <Container bg="#A0AEC0" color="black" m={1}>
        Creative Task: {task}
      </Container>
      <Textarea
        value={text}
        onChange={handleChange}
        rows={20}
        placeholder="Notepad for Recording Task Output and Writing Drafts..."
        w="full"
        bg="white"
        visibility={isOpen ? "visible" : "hidden"}
      />
    </Box>
  )
}

export default Notepad
