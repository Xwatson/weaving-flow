import React, { useState, useEffect } from "react";
import { Button, Table, Space, Tag, message } from "antd";
import {
  PlusOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/utils/trpc";

const Workflow: React.FC = () => {
  const navigate = useNavigate();
  const { data: workflows, isLoading, refetch } = trpc.workflow.list.useQuery();

  // 添加状态管理
  const [runningInstances, setRunningInstances] = useState<
    Record<string, string>
  >({});
  const [statusPolling, setStatusPolling] = useState<
    Record<string, NodeJS.Timeout>
  >({});
  const [workflowStatuses, setWorkflowStatuses] = useState<Record<string, any>>(
    {}
  );

  // 执行工作流
  const executeMutation = trpc.workflow.execute.useMutation({
    onSuccess: (data, variables) => {
      message.success("工作流开始执行");
      // 保存工作流实例ID
      setRunningInstances((prev) => ({
        ...prev,
        [variables.id]: data.instanceId,
      }));

      // 开始轮询工作流状态
      startPollingStatus(variables.id, data.instanceId);

      refetch();
    },
    onError: (error) => {
      message.error(error.message || "执行失败");
    },
  });

  // 停止工作流
  const stopWorkflowMutation = trpc.workflow.stopWorkflow.useMutation({
    onSuccess: (_, variables) => {
      message.success("工作流已停止");

      // 停止轮询
      const workflowId = Object.keys(runningInstances).find(
        (key) => runningInstances[key] === variables.instanceId
      );

      if (workflowId && statusPolling[workflowId]) {
        clearInterval(statusPolling[workflowId]);

        // 清理状态
        setStatusPolling((prev) => {
          const newPolling = { ...prev };
          delete newPolling[workflowId];
          return newPolling;
        });

        setRunningInstances((prev) => {
          const newInstances = { ...prev };
          delete newInstances[workflowId];
          return newInstances;
        });
      }

      refetch();
    },
    onError: () => {
      message.error("停止工作流失败");
    },
  });

  // 获取工作流状态
  const { refetch: refetchStatus } = trpc.workflow.getWorkflowStatus.useQuery(
    { instanceId: "" }, // 默认空ID，不会实际查询
    {
      enabled: false, // 默认不启用，通过手动调用refetchStatus触发
    }
  );

  // 开始轮询工作流状态
  const startPollingStatus = (workflowId: string, instanceId: string) => {
    // 先清除可能存在的轮询
    if (statusPolling[workflowId]) {
      clearInterval(statusPolling[workflowId]);
    }

    // 设置新的轮询
    const intervalId = setInterval(async () => {
      try {
        const result = await refetchStatus({
          queryKey: ["workflow.getWorkflowStatus", { instanceId }],
        });
        const status = result.data;

        // 更新状态
        setWorkflowStatuses((prev) => ({
          ...prev,
          [workflowId]: status,
        }));

        // 如果工作流已完成或出错，停止轮询
        if (
          status &&
          (status.status === "completed" ||
            status.status === "error" ||
            status.status === "stopped")
        ) {
          clearInterval(intervalId);

          setStatusPolling((prev) => {
            const newPolling = { ...prev };
            delete newPolling[workflowId];
            return newPolling;
          });

          setRunningInstances((prev) => {
            const newInstances = { ...prev };
            delete newInstances[workflowId];
            return newInstances;
          });

          refetch();
        }
      } catch (error) {
        clearInterval(intervalId);
        console.error("获取工作流状态失败", error);
      }
    }, 3000); // 每3秒轮询一次

    // 保存轮询ID
    setStatusPolling((prev) => ({
      ...prev,
      [workflowId]: intervalId,
    }));
  };

  // 组件卸载时清除所有轮询
  useEffect(() => {
    return () => {
      Object.values(statusPolling).forEach((intervalId) => {
        clearInterval(intervalId);
      });
    };
  }, [statusPolling]);

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
      render: (status: string, record: any) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status === "active" ? "运行中" : "未运行"}
          {/* {workflowStatuses[record.id] && (
            <span>
              ({workflowStatuses[record.id].status === 'running' ? '运行中' :'未运行'})
            </span>
          )} */}
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
            icon={<StopOutlined />}
            onClick={() => handleStop(runningInstances[record.id], record.id)}
            loading={stopWorkflowMutation.isLoading}
          >
            停止
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

  const handleStop = async (instanceId: string = "", id: string) => {
    await stopWorkflowMutation.mutateAsync({ instanceId, id });
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
