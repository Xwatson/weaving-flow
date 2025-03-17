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
      if (contextMenu) {
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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
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
    [onNodeSave]
  );

  const contextMenuItems = [
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
            menu={{ items: contextMenuItems }}
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
      message.success("创建成功");
      navigate(`/admin/workflow/edit/${data.id}`);
    },
    onError: (error) => {
      message.error(error.message || "创建失败");
    },
  });

  const updateMutation = trpc.workflow.update.useMutation({
    onSuccess: () => {
      message.success("更新成功");
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

  const onSave = useCallback(
    async (data: any) => {
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
    },
    [isEdit, id, createMutation, updateMutation]
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

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
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
    [form, onSave]
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
