import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FormInstance } from "antd";
import ScriptModal from "./ScriptModal";
import { ScriptItem } from "./types";
import DraggableTable from "./DraggableTable";

interface ScriptTableProps {
  form: FormInstance;
  scripts?: ScriptItem[];
}

const ScriptTable: React.FC<ScriptTableProps> = ({ form, scripts }) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 30,
      render: (_: string, record: ScriptItem, index: number) => index,
    },
    {
      title: "执行类型",
      dataIndex: "type",
      key: "type",
      width: 140,
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
      width: 270,
      render: (_: string, record: ScriptItem) => {
        let str = "";
        if (record.type === "script") {
          str = record.script ? record.script : "-";
        } else if (record.type === "delay") {
          str = `${record.delay || "-"} 毫秒`;
        } else if (
          record.type === "waitForSelector" ||
          record.type === "click"
        ) {
          str = `选择器: ${record.selector || "-"}, 超时: ${record.timeout || "-"} 毫秒`;
        }
        return (
          <div
            className="truncate"
            title={str}
            style={{ width: 180, overflow: "hidden" }}
          >
            {str}
          </div>
        );
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
    const currentScripts = scripts || [];

    if (index !== null) {
      // 编辑现有项
      const newScripts = [...currentScripts];
      if (index === null) {
        newScripts.push(values);
      } else {
        newScripts[index] = values;
      }
      form.setFieldValue("scripts", newScripts);
    } else {
      // 添加新项
      form.setFieldValue("scripts", [...currentScripts, values]);
    }

    handleCloseModal();
  };

  return (
    <div>
      <DraggableTable
        form={form}
        dataSource={scripts?.map((item: ScriptItem, index: number) => ({
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
        initialValues={
          editingIndex !== null ? scripts?.[editingIndex] : undefined
        }
        editingIndex={editingIndex}
        form={form}
      />
    </div>
  );
};

export default ScriptTable;
