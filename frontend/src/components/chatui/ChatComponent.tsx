// @ts-nocheck
// Based on https://blog.openreplay.com/build-a-chatbot-with-chatgpt-and-react/
import { useRef, useState, useEffect } from "react"
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css"
import "../../css/chat.css"
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react"
import { MessageDirection } from "@chatscope/chat-ui-kit-react/src/types/unions"
import {
  Box,
  Button,
  Container,
  Flex,
  Spacer,
  VStack,
  useDisclosure,
  Text,
} from "@chakra-ui/react"
import Notepad from "./Notepad"
import { FaCheck } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import SubmissionAlert from "./SubmissionAlert"
import {
  fetchUserOrders,
  fetchUserTasks,
  getTaskString,
} from "../../library/userInfo"

const FLASK_API_URL = `${process.env.REACT_APP_API_URL}/api/chat`
const content = {
  "1": [
    "What was the childhood/background of the character?",
    "What are key traits of a strong character (protagonist/antagonist?",
    "Describe the character's appearance.",
    "Suggest a few personality traits for the character.",
  ],
  "2": [
    "Describe the fauna and flora of the environment.",
    "Describe the landscape the world is situated in more detail.",
    "What is the social structure of the community? Who holds the most authority?",
    "What tools can be built to leverage the environment?",
  ],
}

function ChatComponent() {
  const navigate = useNavigate()
  const submit = useDisclosure()
  const cancelRef = useRef()
  const [msg, setMsg] = useState("")
  const [isChatbotTyping, setIsChatbotTyping] = useState(false)
  const [task_output2, setTaskOutput2] = useState("")
  const [taskString, setTaskString] = useState("")
  const [taskType, setTaskType] = useState("")
  const [chatMessages, setChatMessages] = useState([
    {
      content:
        "Please provide me with questions I can answer to help you with your task.",
      sender: "Mistral",
      direction: "incoming",
    },
  ])

  // Initialise task based on order and type. use useffect to initialize.

  async function initialSetup() {
    const userId = localStorage.getItem("userId")
    const orders = await fetchUserOrders(userId)
    const task = await fetchUserTasks(userId)
    setTaskType(task)
    const taskString = getTaskString("2", orders, task)
    const initialMessages = []
    initialMessages.push({
      content:
        taskString +
        " I will provide you with questions. Answer them to help me with this task.",
      sender: "user",
      direction: "outgoing",
    })
    initialMessages.push({
      content: "Sure. What questions do you want me to answer?",
      sender: "Mistral",
      direction: "incoming",
    })
    setChatMessages(initialMessages)
    setTaskString(taskString)
  }

  useEffect(() => {
    initialSetup()
  }, [])

  const handleSubmit = async () => {
    const userid = localStorage.getItem("userId")
    if (!userid) {
      console.error("User ID not found in local storage")
      return
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/submit2?userid=${userid}&task_output=${task_output2}`,
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

  async function fetchImage(promptToPass) {
    const apiUrl = `${process.env.REACT_APP_API_URL}/api/image?prompt=${encodeURIComponent(promptToPass)}`

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const imageBlob = await response.blob()
      const imageURL = URL.createObjectURL(imageBlob)
      return imageURL
    } catch (error) {
      console.error("Error fetching image:", error)
    }
  }

  const handleImageGeneration = async (userMessage) => {
    const newUserMessage = {
      content: "Generate Image with Stable Diffusion of: " + userMessage,
      sender: "user",
      direction: "outgoing",
      image: true,
    }

    const updatedChatMessages = [...chatMessages, newUserMessage]
    setChatMessages(updatedChatMessages)
    setMsg("")
    setIsChatbotTyping(true)
    console.log(userMessage)
    const imageURL = await fetchImage(userMessage)
    setChatMessages([
      ...updatedChatMessages,
      {
        image_src: imageURL,
        sender: "Mistral",
        direction: "incoming",
        image: true,
      },
    ])
    setIsChatbotTyping(false)
  }

  const handleUserMessage = async (userMessage) => {
    const newUserMessage = {
      content: userMessage,
      sender: "user",
      direction: "outgoing",
    }

    const updatedChatMessages = [...chatMessages, newUserMessage]
    setChatMessages(updatedChatMessages)

    setIsChatbotTyping(true)
    await processUserMessageToMistral(updatedChatMessages)
  }

  async function processUserMessageToMistral(messages) {
    let apiMessages = messages
      .filter((messageObject) => !messageObject.image)
      .map((messageObject) => {
        let role = messageObject.sender === "Mistral" ? "assistant" : "user"
        return { role: role, content: messageObject.content }
      })

    const systemMessage = {
      role: "system",
      content:
        "You are a helpful AI assistant assisting the user with a creative task.",
    }

    const apiRequestBody = {
      model: "mistral-8b",
      messages: [systemMessage, ...apiMessages],
    }

    await fetch(FLASK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => data.json())
      .then((data) => {
        setChatMessages([
          ...messages,
          {
            content: data.response,
            sender: "Mistral",
            direction: "incoming",
          },
        ])
        setIsChatbotTyping(false)
        setMsg("")
      })
  }

  return (
    <Flex h="100vh" bg="#CBD5E0">
      <Box flex="1" overflow="hidden">
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={
                isChatbotTyping ? (
                  <TypingIndicator content="Mistral is thinking" />
                ) : null
              }
            >
              {chatMessages.map((message, i) =>
                "image_src" in message ? (
                  <Message
                    key={i}
                    model={{
                      message: "",
                      sender: message.sender,
                      direction: message.direction as MessageDirection,
                      position: "normal",
                    }}
                  >
                    <Message.ImageContent src={message.image_src} />
                  </Message>
                ) : (
                  <Message
                    key={i}
                    model={{
                      message: message.content,
                      sender: message.sender,
                      direction: message.direction as MessageDirection,
                      position: "normal",
                    }}
                  />
                ),
              )}
            </MessageList>
            {/* @ts-ignore */}
            <div
              as={MessageInput}
              style={{
                display: "flex",
                alignItems: "center",
                borderTop: "1px dashed #d1dbe4",
              }}
            >
              <MessageInput
                placeholder="Type your message here"
                attachButton={false}
                sendOnReturnDisabled={true}
                onSend={handleUserMessage}
                style={{ flexGrow: "1" }}
                onChange={(msg) => setMsg(msg)}
                value={msg}
              />
              <Button
                bg="green.500"
                h="100%"
                style={{ paddingLeft: "0.2em", paddingRight: "0.2em" }}
                fontSize={12}
                onClick={() => handleImageGeneration(msg)}
                spacing={1}
              >
                Generate Image
              </Button>
            </div>
          </ChatContainer>
        </MainContainer>
      </Box>
      <VStack flex="0.3" bg="#E2E8F0" p={4} spacing={4}>
        <Button
          leftIcon={<FaCheck />}
          colorScheme="green"
          onClick={submit.onOpen}
          size="lg"
        >
          Submit
        </Button>
        <Notepad
          text={task_output2}
          setText={setTaskOutput2}
          task={taskString}
        />
        <Spacer />
      </VStack>
      <VStack flex="0.15" bg="#BEE3F8" p={4} spacing={4} overflowY="auto">
        <Text fontSize="lg" fontWeight="bold" pb={2}>
          Example Queries:
        </Text>
        {taskType &&
          content[taskType]?.map((query, index) => (
            <Text key={index} fontSize="sm">
              {query}
            </Text>
          ))}
      </VStack>
      <SubmissionAlert
        isOpen={submit.isOpen}
        onClose={submit.onClose}
        onOpen={submit.onOpen}
        cancelRef={cancelRef}
        onClickYes={async () => {
          handleSubmit()
          if ((await fetchUserOrders(localStorage.getItem("userId"))) === "1") {
            navigate("/form")
          } else {
            navigate("/app")
          }
        }}
        text={task_output2}
      />
    </Flex>
  )
}

export default ChatComponent
