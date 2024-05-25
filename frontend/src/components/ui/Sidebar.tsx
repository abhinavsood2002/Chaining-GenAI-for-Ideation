import React, { useEffect, useState } from "react"
import {
  Box,
  Text,
  VStack,
  IconButton,
  Tooltip,
  Divider,
} from "@chakra-ui/react"
import { MdFullscreen, MdFullscreenExit } from "react-icons/md"
import { SidebarState } from "../../states/SidebarState"
import "../../css/sidebarscrollbar.css"
const Sidebar = () => {
  const [open, setOpen] = useState(true)
  const [options, setOptions] = useState(SidebarState)
  const userId = localStorage.getItem("userId")

  // Populate Sidebar based on userId
  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_URL}/api/get-user-templates?userid=${encodeURIComponent(userId)}`,
    )
      .then((response) => response.json())
      .then((data) => {
        // Assuming multiple files, each containing "nodes" and "edges"
        Object.keys(data).forEach((fileName) => {
          const { nodes, edges } = JSON.parse(data[fileName])

          const updatedOptions = SidebarState.map((option, index) => {
            if (index === 1) {
              // Create a copy of the specific option that needs to be updated
              return {
                ...option,
                options: [...option.options, fileName.replace(".json", "")],
                options_type: [...option.options_type, "template"],
                options_template: [
                  ...option.options_template,
                  { nodes, edges },
                ],
              }
            }
            return option
          })

          setOptions(updatedOptions)
        })
      })
      .catch((error) => console.error("Error fetching JSON files:", error))
  }, [])

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    jsonData: string,
  ) => {
    if (nodeType === "template") {
      event.dataTransfer.setData("application/json", jsonData)
    }
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const handleDrop = async (event) => {
    event.preventDefault()

    // Check if there are objects other than files being dropped
    if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) {
      console.log("Only files are allowed.")
      return
    }
    const files = event.dataTransfer.files

    // Prevent non-json files from being dropped
    for (let file of files) {
      if (file.type !== "application/json") {
        console.log("Only JSON files are allowed.")
        return
      }

      const fileContent = await file.text()
      const { nodes, edges } = JSON.parse(fileContent)

      // Add uploaded file to custom templates options group
      const updatedOptions = [...options]
      updatedOptions[1].options.push(file.name.replace(".json", ""))
      updatedOptions[1].options_type.push("template")
      updatedOptions[1].options_template.push({
        nodes,
        edges,
      })

      console.log(updatedOptions)
      setOptions(updatedOptions)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }
  const toggleSidebar = () => {
    setOpen(!open)
  }

  return (
    <Box
      pos="fixed"
      left={open ? 0 : "-200px"}
      top={0}
      h="100vh"
      w="200px"
      bg="gray.700"
      color="white"
      p={5}
      overflowY="scroll"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <VStack align="start" spacing={4} paddingBottom={10}>
        {options.map((optionGroup) => (
          <VStack key={optionGroup.heading} align="start" spacing={2}>
            <Text fontWeight="bold">{optionGroup.heading}</Text>
            <Divider />
            {optionGroup.options.map((option, index) => (
              <Tooltip label="Drag and Drop into Workspace">
                <Box
                  key={option}
                  borderWidth="1px"
                  borderStyle="dotted"
                  borderRadius="1g"
                  onDragStart={(event) => {
                    if (optionGroup.options_type[index] === "template") {
                      onDragStart(
                        event,
                        optionGroup.options_type[index],
                        JSON.stringify(optionGroup.options_template[index]),
                      )
                    } else {
                      onDragStart(event, optionGroup.options_type[index], "")
                    }
                  }}
                  draggable
                  width="100%"
                  cursor="grab"
                  _hover={{
                    background: "blue.300",
                    color: "while",
                  }}
                >
                  {option}
                </Box>
              </Tooltip>
            ))}
            {optionGroup.options.length === 0 && (
              <Box bg="gray.600" color="white" p={2} borderRadius="md" mt={2}>
                No Custom templates added yet, drag in compatible ".json" files
                to use Custom Templates.
              </Box>
            )}
          </VStack>
        ))}
      </VStack>
      <Tooltip label="Open/Close Sidebar">
        <IconButton
          icon={open ? <MdFullscreenExit /> : <MdFullscreen />}
          onClick={toggleSidebar}
          width="100px"
          background="gray.300"
          pos="fixed"
          bottom={4}
          left="40px"
          aria-label="Collapse Sidebar"
        />
      </Tooltip>
    </Box>
  )
}
export default Sidebar
