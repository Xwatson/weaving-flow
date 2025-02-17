import React from "react";
import { Button, Table, Space, Tag, message } from "antd";
import {
  PlusOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/utils/trpc";

const Workflow: React.FC = () => {
  const navigate = useNavigate();
  const { data: workflows, isLoading, refetch } = trpc.workflow.list.useQuery();
  
  const executeMutation = trpc.workflow.execute.useMutation({
    onSuccess: () => {
      message.success("工作流开始执行");
      refetch();
    },
    onError: () => {
      message.error("执行失败");
    },
  });

  const deleteMutation = trpc.workflow.delete.useMutation({
    onSuccess: () => {
      message.success("删除成功");
      refetch();
    },
    onError: () => {
      message.error("删除失败");
    },
  });

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status === "active" ? "运行中" : "未运行"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRun(record.id)}
            loading={executeMutation.isLoading}
          >
            运行
          </Button>
          <Button
            type="link"
            onClick={() => navigate(`/admin/workflow/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            loading={deleteMutation.isLoading}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleRun = async (id: string) => {
    await executeMutation.mutateAsync({ id });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/workflow/create")}
        >
          新建工作流
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={workflows}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
};

export default Workflow;
