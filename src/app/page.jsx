"use client";

import React, { useCallback, useMemo, useState, memo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  Box,
  Paper,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

/* ===================== HELPERS ===================== */

const uuid = () => crypto.randomUUID();

const cloneSubTree = (nodeId, nodes, edges, idMap = new Map()) => {
  const newId = uuid();
  idMap.set(nodeId, newId);

  const node = nodes.find((n) => n.id === nodeId);

  let clonedNodes = [
    {
      ...node,
      id: newId,
      position: { ...node.position },
      data: { ...node.data },
    },
  ];

  let clonedEdges = [];

  const childrenEdges = edges.filter((e) => e.source === nodeId);

  childrenEdges.forEach((edge) => {
    const { nodes: childNodes, edges: childEdges } = cloneSubTree(
      edge.target,
      nodes,
      edges,
      idMap
    );

    clonedNodes.push(...childNodes);

    clonedEdges.push({
      id: uuid(),
      source: newId,
      target: idMap.get(edge.target),
    });

    clonedEdges.push(...childEdges);
  });

  return { nodes: clonedNodes, edges: clonedEdges };
};

/* ===================== CUSTOM NODE ===================== */

const CustomNode = memo(({ data }) => {
  return (
    <Paper
      onContextMenu={(e) => data.onContextMenu(e, data.node)}
      elevation={0}
      sx={{
        px: 3,
        py: 1.5,
        minWidth: 160,
        textAlign: "center",
        border: "1px solid #1976d2",
        borderRadius: 2,
        bgcolor: "#fff",
        cursor: "context-menu",
      }}
    >
      <Handle type="target" position={Position.Right} />
      {data.label}
      <Handle type="source" position={Position.Left} />
    </Paper>
  );
});

/* ===================== PAGE ===================== */

export default function FlowChartPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "root",
      type: "custom",
      position: { x: 1200, y: 50 },
      data: { label: "حساب‌های اصلی" },
    },

    /* ================= دارایی‌ها ================= */

    {
      id: "assets",
      type: "custom",
      position: { x: 950, y: 150 },
      data: { label: "دارایی‌های جاری" },
    },

    { id: "cash", type: "custom", position: { x: 700, y: 80 }, data: { label: "وجوه نقد" } },
    { id: "bank", type: "custom", position: { x: 700, y: 150 }, data: { label: "بانک" } },
    {
      id: "shortInvest",
      type: "custom",
      position: { x: 700, y: 220 },
      data: { label: "سایر حساب‌های دریافتنی کوتاه‌مدت" },
    },

    /* ================= بدهی‌ها ================= */

    {
      id: "liabilities",
      type: "custom",
      position: { x: 950, y: 330 },
      data: { label: "بدهی‌های جاری" },
    },

    {
      id: "payable",
      type: "custom",
      position: { x: 700, y: 330 },
      data: { label: "حساب‌های پرداختنی تجاری" },
    },

    {
      id: "tax",
      type: "custom",
      position: { x: 450, y: 280 },
      data: { label: "مالیات پرداختنی" },
    },
    {
      id: "insurance",
      type: "custom",
      position: { x: 450, y: 330 },
      data: { label: "بیمه پرداختنی" },
    },
    {
      id: "salary",
      type: "custom",
      position: { x: 450, y: 380 },
      data: { label: "حقوق پرداختنی" },
    },

    /* ================= درآمد ================= */

    {
      id: "income",
      type: "custom",
      position: { x: 950, y: 520 },
      data: { label: "درآمد" },
    },

    {
      id: "operIncome",
      type: "custom",
      position: { x: 700, y: 470 },
      data: { label: "درآمدهای عملیاتی" },
    },
    {
      id: "nonOperIncome",
      type: "custom",
      position: { x: 700, y: 550 },
      data: { label: "درآمدهای غیرعملیاتی" },
    },

    { id: "sales", type: "custom", position: { x: 450, y: 450 }, data: { label: "درآمد فروش" } },
    {
      id: "service",
      type: "custom",
      position: { x: 450, y: 500 },
      data: { label: "درآمد ارائه خدمات" },
    },

    /* ================= هزینه ================= */

    {
      id: "expense",
      type: "custom",
      position: { x: 950, y: 720 },
      data: { label: "هزینه‌ها" },
    },

    {
      id: "adminExpense",
      type: "custom",
      position: { x: 700, y: 720 },
      data: { label: "هزینه‌های اداری" },
    },

    { id: "rent", type: "custom", position: { x: 450, y: 680 }, data: { label: "اجاره" } },
    { id: "salaryExp", type: "custom", position: { x: 450, y: 730 }, data: { label: "حقوق" } },
    { id: "insuranceExp", type: "custom", position: { x: 450, y: 780 }, data: { label: "بیمه" } },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    /* ================= دارایی‌ها ================= */
    { id: "root-assets", source: "root", target: "assets" },
    { id: "assets-cash", source: "assets", target: "cash" },
    { id: "assets-bank", source: "assets", target: "bank" },
    { id: "assets-shortInvest", source: "assets", target: "shortInvest" },

    /* ================= بدهی‌ها ================= */
    { id: "root-liabilities", source: "root", target: "liabilities" },
    { id: "liabilities-payable", source: "liabilities", target: "payable" },
    { id: "liabilities-tax", source: "liabilities", target: "tax" },
    { id: "liabilities-insurance", source: "liabilities", target: "insurance" },
    { id: "liabilities-salary", source: "liabilities", target: "salary" },

    /* ================= درآمد ================= */
    { id: "root-income", source: "root", target: "income" },
    { id: "income-operIncome", source: "income", target: "operIncome" },
    { id: "income-nonOperIncome", source: "income", target: "nonOperIncome" },
    { id: "operIncome-sales", source: "operIncome", target: "sales" },
    { id: "operIncome-service", source: "operIncome", target: "service" },

    /* ================= هزینه ================= */
    { id: "root-expense", source: "root", target: "expense" },
    { id: "expense-adminExpense", source: "expense", target: "adminExpense" },
    { id: "adminExpense-rent", source: "adminExpense", target: "rent" },
    { id: "adminExpense-salaryExp", source: "adminExpense", target: "salaryExp" },
    { id: "adminExpense-insuranceExp", source: "adminExpense", target: "insuranceExp" },
  ]);


  const [menu, setMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [clipboard, setClipboard] = useState(null);

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  /* ===================== CONTEXT MENU ===================== */

  const onContextMenu = useCallback((e, node) => {
    e.preventDefault();
    setSelectedNode(node);
    setMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeMenu = () => setMenu(null);

  const hasChild = (id) => edges.some((e) => e.source === id);

  /* ===================== ACTIONS ===================== */

  const addChild = () => {
    const id = uuid();

    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "custom",
        position: {
          x: selectedNode.position.x - 250,
          y: selectedNode.position.y + 120,
        },
        data: { label },
      },
    ]);

    setEdges((eds) => [
      ...eds,
      { id: uuid(), source: selectedNode.id, target: id },
    ]);

    setLabel("");
    setOpen(false);
    closeMenu();
  };

  const deleteNode = () => {
    if (hasChild(selectedNode.id)) {
      alert("نودی که فرزند دارد قابل حذف نیست");
      return;
    }

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
      )
    );

    closeMenu();
  };

  const cutNode = () => {
    if (hasChild(selectedNode.id)) {
      alert("Cut فقط برای نود بدون فرزند مجاز است");
      return;
    }

    // clone subtree (even for a single node) so paste can reuse the same shape
    const subtree = cloneSubTree(selectedNode.id, nodes, edges);
    setClipboard({ type: "cut", subtree, originalId: selectedNode.id });
    deleteNode();
  };

  const copyNode = () => {
    const subtree = cloneSubTree(selectedNode.id, nodes, edges);
    setClipboard({ type: "copy", subtree });
    closeMenu();
  };

  const pasteNode = () => {
    if (!clipboard) return;

    const offsetX = -250;
    const offsetY = 120;

    const pastedNodes = clipboard.subtree.nodes.map((n, i) => ({
      ...n,
      position: {
        x:
          n.position.x -
          clipboard.subtree.nodes[0].position.x +
          selectedNode.position.x +
          offsetX,
        y:
          n.position.y -
          clipboard.subtree.nodes[0].position.y +
          selectedNode.position.y +
          offsetY,
      },
    }));

    const rootId = pastedNodes[0].id;

    setNodes((nds) => [...nds, ...pastedNodes]);
    setEdges((eds) => [
      ...eds,
      ...clipboard.subtree.edges,
      { id: uuid(), source: selectedNode.id, target: rootId },
    ]);

    setClipboard(null);
    closeMenu();
  };

  /* ===================== ENRICH NODES ===================== */

  const enrichedNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onContextMenu,
          node: n,
        },
      })),
    [nodes, onContextMenu]
  );

  return (
    <Box sx={{ height: "100vh", direction: "rtl" }}>
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        nodeTypes={{ custom: CustomNode }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {/* CONTEXT MENU */}
      <Menu
        open={Boolean(menu)}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={menu ? { top: menu.y, left: menu.x } : undefined}
      >
        <MenuItem onClick={() => setOpen(true)}>افزودن زیرشاخه</MenuItem>
        <MenuItem onClick={cutNode}>Cut</MenuItem>
        <MenuItem onClick={copyNode}>Copy</MenuItem>
        <MenuItem onClick={pasteNode} disabled={!clipboard}>
          Paste
        </MenuItem>
        <MenuItem onClick={deleteNode}>Delete</MenuItem>
      </Menu>

      {/* ADD CHILD MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>افزودن زیرشاخه</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="عنوان"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button onClick={addChild}>افزودن</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
