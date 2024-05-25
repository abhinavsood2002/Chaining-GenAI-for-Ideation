import ChainNode from "../components/nodes/ChainNode"
import TextToImageNode from "../components/nodes/TextToImageNode"
import PromptNode from "../components/nodes/PromptNode"
import InputNode from "../components/nodes/InputNode"

export const NodeTypes = {
  chain_node: ChainNode,
  txt_to_img: TextToImageNode,
  prompt_node: PromptNode,
  input_node: InputNode,
}

export function nodeMinimapColors(node) {
  switch (node.type) {
    case "chain_node":
      return "#6ede87"
    case "txt_to_img":
      return "#6865A5"
    case "prompt_node":
      return "#1365A5"
    case "input_node":
      return "#A12313"
    default:
      return "#ff0072"
  }
}
