import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FormInstance } from "antd";
import ScriptModal from "./ScriptModal";
import { ScriptItem } from "./types";
import DraggableTable from "./DraggableTable";

interface ScriptTableProps {
  form: FormInstance;
}

const ScriptTable: React.FC<ScriptTableProps> = ({ form }) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const scripts = form.getFieldValue("scripts") || [];

  const columns = [
    {
      title: "执行类型",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          script: "脚本",
          delay: "延迟",
          waitForSelector: "等待选择器",
          click: "点击",
        };
        return typeMap[type] || type;
      },
    },
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      render: (_: string, record: ScriptItem) => {
        if (record.type === "script") {
          return record.script ? record.script.substring(0, 30) + (record.script.length > 30 ? "..." : "") : "-";
        } else if (record.type === "delay") {
          return `${record.delay || "-"} 毫秒`;
        } else if (record.type === "waitForSelector" || record.type === "click") {
          return `选择器: ${record.selector || "-"}, 超时: ${record.timeout || "-"} 毫秒`;
        }
        return "-";
      },
    },
  ];

  const handleOpenModal = (index: number | null = null) => {
    setEditingIndex(index);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingIndex(null);
  };

  const handleSave = (values: ScriptItem, index: number | null) => {
    const currentScripts = form.getFieldValue("scripts") || [];
    
    if (index !== null) {
      // 编辑现有项
      const newScripts = [...currentScripts];
      newScripts[index] = values;
      form.setFieldsValue({ scripts: newScripts });
    } else {
      // 添加新项
      form.setFieldsValue({ scripts: [...currentScripts, values] });
    }
    
    handleCloseModal();
  };

  return (
    <div>
      <DraggableTable
        form={form}
        dataSource={scripts.map((item: ScriptItem, index: number) => ({
          ...item,
          key: index,
        }))}
        columns={columns}
        pagination={false}
        onOpenModal={handleOpenModal}
      />
      <Button
        type="dashed"
        onClick={() => handleOpenModal()}
        style={{ marginTop: 16 }}
        block
        icon={<PlusOutlined />}
      >
        添加一段脚本
      </Button>

      <ScriptModal
        visible={isModalVisible}
        onCancel={handleCloseModal}
        onSave={handleSave}
        initialValues={editingIndex !== null ? scripts[editingIndex] : undefined}
        editingIndex={editingIndex}
        form={form}
      />
    </div>
  );
};

export default ScriptTable;
