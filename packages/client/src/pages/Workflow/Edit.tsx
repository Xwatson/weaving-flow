import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  Layout,
  theme,
  Dropdown,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { trpc } from "@/utils/trpc";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  useReactFlow,
  XYPosition,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import styles from "./index.module.less";
import {
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
} from "@ant-design/icons";
import NodeEditor from "./components/NodeEditor";

const { Sider, Content } = Layout;

interface FlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodeSave?: (nodes: Node[]) => void;
}

const Flow: React.FC<FlowProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes,
  onNodeSave,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    position: XYPosition;
    type: "pane" | "node" | "edge";
    id?: string;
  } | null>(null);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeEditorOpen, setNodeEditorOpen] = useState(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const boundingRect = reactFlowWrapper.current?.getBoundingClientRect();
      if (boundingRect) {
        const position = project({
          x: event.clientX - boundingRect.left,
          y: event.clientY - boundingRect.top,
        });
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          position,
          type: "pane",
        });
      }
    },
    [project]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const boundingRect = reactFlowWrapper.current?.getBoundingClientRect();
      if (boundingRect) {
        const position = project({
          x: event.clientX - boundingRect.left,
          y: event.clientY - boundingRect.top,
        });
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          position,
          type: "node",
          id: node.id,
        });
        setSelectedNode(node);
      }
    },
    [project]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      const boundingRect = reactFlowWrapper.current?.getBoundingClientRect();
      if (boundingRect) {
        const position = project({
          x: event.clientX - boundingRect.left,
          y: event.clientY - boundingRect.top,
        });
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          position,
          type: "edge",
          id: edge.id,
        });
      }
    },
    [project]
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const addNode = useCallback(
    (type: string) => {
      if (contextMenu && contextMenu.type === "pane") {
        const newNode: Node = {
          id: `${type}-${Date.now()}`,
          type,
          position: contextMenu.position,
          data: { label: `${type} node` },
        };
        onNodesChange([{ type: "add", item: newNode }]);
        setContextMenu(null);
      }
    },
    [contextMenu, onNodesChange]
  );

  const deleteNode = useCallback(() => {
    if (contextMenu && contextMenu.type === "node" && contextMenu.id) {
      onNodesChange([{ type: "remove", id: contextMenu.id }]);
      setContextMenu(null);
    }
  }, [contextMenu, onNodesChange]);

  const deleteEdge = useCallback(() => {
    if (contextMenu && contextMenu.type === "edge" && contextMenu.id) {
      onEdgesChange([{ type: "remove", id: contextMenu.id }]);
      setContextMenu(null);
    }
  }, [contextMenu, onEdgesChange]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeEditorOpen(true);
  }, []);

  const handleNodeSave = useCallback(
    (updatedNode: Node) => {
      const newNodes = nodes.map((node) => {
        if (node.id === updatedNode.id) {
          return updatedNode;
        }
        return node;
      });
      setNodes(newNodes);
      onNodeSave?.(newNodes);
    },
    [nodes, setNodes, onNodeSave]
  );

  // Context menu items for pane (background)
  const paneContextMenuItems = [
    {
      key: "start",
      label: "开始节点",
      onClick: () => addNode("start"),
    },
    {
      key: "end",
      label: "结束节点",
      onClick: () => addNode("end"),
    },
    {
      key: "browser",
      label: "浏览器节点",
      onClick: () => addNode("browser"),
    },
    {
      key: "loop",
      label: "循环节点",
      onClick: () => addNode("loop"),
    },
  ];

  // Context menu items for node
  const nodeContextMenuItems = [
    {
      key: "edit",
      label: "编辑节点",
      onClick: () => {
        if (selectedNode) {
          setNodeEditorOpen(true);
          setContextMenu(null);
        }
      },
    },
    {
      key: "delete",
      label: "删除节点",
      onClick: deleteNode,
    },
  ];

  // Context menu items for edge
  const edgeContextMenuItems = [
    {
      key: "delete",
      label: "删除连线",
      onClick: deleteEdge,
    },
  ];

  // Determine which context menu items to show based on the context
  const getContextMenuItems = () => {
    if (!contextMenu) return [];

    switch (contextMenu.type) {
      case "node":
        return nodeContextMenuItems;
      case "edge":
        return edgeContextMenuItems;
      case "pane":
      default:
        return paneContextMenuItems;
    }
  };

  return (
    <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            width: 200,
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
          }}
        >
          <Dropdown
            menu={{ items: getContextMenuItems() }}
            open={true}
            trigger={["contextMenu"]}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentNode as HTMLElement
            }
          >
            <Button
              style={{ border: "none", padding: 0, width: 0, height: 0 }}
            />
          </Dropdown>
        </div>
      )}
      <NodeEditor
        node={selectedNode}
        open={nodeEditorOpen}
        onClose={() => setNodeEditorOpen(false)}
        onSave={handleNodeSave}
      />
    </div>
  );
};

const WorkflowEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [collapsed, setCollapsed] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  // 添加防抖定时器引用
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: workflow, isLoading } = trpc.workflow.getById.useQuery(
    { id: id! },
    {
      enabled: isEdit,
      retry: false,
    }
  );

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const createMutation = trpc.workflow.create.useMutation({
    onSuccess: (data) => {
      console.log("创建成功");
      navigate(`/admin/workflow/edit/${data.id}`);
    },
    onError: (error) => {
      message.error(error.message || "创建失败");
    },
  });

  const updateMutation = trpc.workflow.update.useMutation({
    onSuccess: () => {
      console.log("更新成功");
    },
    onError: (error) => {
      message.error(error.message || "更新失败");
    },
  });

  useEffect(() => {
    if (workflow) {
      form.setFieldsValue({
        name: workflow.name,
        description: workflow.description,
      });
      const config: Record<string, any> = workflow.config
        ? JSON.parse(workflow.config)
        : {};
      if (config?.nodes) {
        setNodes(config.nodes);
      }
      if (config?.edges) {
        setEdges(config.edges);
      }
    }
  }, [workflow, form]);

  const debouncedSave = useCallback(
    (data: any) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (isEdit) {
            await updateMutation.mutateAsync({
              id,
              data,
            });
          } else {
            await createMutation.mutateAsync(data);
          }
        } catch (error) {}
      }, 500);
    },
    [isEdit, id, createMutation, updateMutation]
  );

  const onSave = useCallback(
    async (data: any) => {
      debouncedSave(data);
    },
    [debouncedSave]
  );

  const onFinish = async (values: any) => {
    const data = {
      ...values,
      config: JSON.stringify({
        nodes,
        edges,
      }),
    };
    await onSave(data);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        // 节点变更后保存更改
        const data = {
          ...form.getFieldsValue(),
          config: JSON.stringify({
            nodes: updatedNodes,
            edges,
          }),
        };
        onSave(data);
        return updatedNodes;
      });
    },
    [edges, form, onSave]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updatedEdges = applyEdgeChanges(changes, eds);
        // 连线变更后保存更改
        const data = {
          ...form.getFieldsValue(),
          config: JSON.stringify({
            nodes,
            edges: updatedEdges,
          }),
        };
        onSave(data);
        return updatedEdges;
      });
    },
    [nodes, form, onSave]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const updatedEdges = addEdge(params, eds);
        // 创建新连接后保存更改
        const data = {
          ...form.getFieldsValue(),
          config: JSON.stringify({
            nodes,
            edges: updatedEdges,
          }),
        };
        onSave(data);
        return updatedEdges;
      });
    },
    [nodes, form, onSave]
  );

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleNodeUpdate = useCallback(
    async (nodes: Node[]) => {
      const data = {
        ...form.getFieldsValue(),
        config: JSON.stringify({
          nodes,
          edges,
        }),
      };

      await onSave(data);
    },
    [form, edges, onSave]
  );

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className={styles.editLayout}>
      <Sider
        className={styles.editSider}
        width={300}
        collapsedWidth={0}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          background: colorBgContainer,
        }}
      >
        <div style={{ padding: "16px" }}>
          <div
            className={styles.editCollapse}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <RightOutlined /> : <LeftOutlined />}
          </div>
          {!collapsed && (
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                name: "",
                description: "",
              }}
            >
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: "请输入工作流名称" }]}
              >
                <Input placeholder="请输入工作流名称" />
              </Form.Item>

              <Form.Item label="描述" name="description">
                <Input.TextArea placeholder="请输入工作流描述" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </Sider>
      <Content>
        {isEdit && isLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : (
          <ReactFlowProvider>
            <Flow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              setNodes={setNodes}
              onNodeSave={handleNodeUpdate}
            />
          </ReactFlowProvider>
        )}
      </Content>
    </Layout>
  );
};

export default WorkflowEdit;
