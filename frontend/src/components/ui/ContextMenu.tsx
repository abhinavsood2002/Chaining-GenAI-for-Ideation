// @ts-nocheck
import React from "react"
import { Menu, MenuList, MenuItem } from "@chakra-ui/react"
import useStore from "../../store"
import { shallow } from "zustand/shallow"
import "../../css/contextMenu.css"

const contextMenuSelector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  duplicateNode: state.duplicateNode,
  deleteNode: state.deleteNode,
})

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  ...props
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nodes, edges, duplicateNode, deleteNode } = useStore(
    contextMenuSelector,
    shallow,
  )

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <Menu isOpen>
        <MenuList>
          <MenuItem onClick={() => duplicateNode(id)}>Duplicate</MenuItem>
          <MenuItem onClick={() => deleteNode(id)}>Delete</MenuItem>
        </MenuList>
      </Menu>
    </div>
  )
}
