import React from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  FormInstance,
  Switch,
} from "antd";
import { ScriptItem, ScriptType, ScriptTypeMap } from "./types";

interface ScriptModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: ScriptItem, index: number | null) => void;
  initialValues?: ScriptItem;
  editingIndex: number | null;
  form: FormInstance;
}

const ScriptModal: React.FC<ScriptModalProps> = ({
  visible,
  onCancel,
  onSave,
  initialValues,
  editingIndex,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ type: "script" });
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(values, editingIndex);
      form.resetFields();
    });
  };

  const renderScriptFields = () => {
    const type = form.getFieldValue("type") as ScriptType;

    switch (type) {
      case "script":
        return (
          <Form.Item
            name="script"
            label="脚本"
            rules={[{ required: true, message: "请输入脚本" }]}
          >
            <Input.TextArea placeholder="请输入脚本" rows={4} />
          </Form.Item>
        );
      case "delay":
        return (
          <Form.Item
            name="delay"
            label="延迟时间"
            rules={[{ required: true, message: "请输入延迟时间" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="请输入时间（毫秒）"
            />
          </Form.Item>
        );
      case "getPageUrl":
        return (
          <Form.Item name="isNewTab" label="是否新标签页打开">
            <Switch />
          </Form.Item>
        );
      case "waitForSelector":
      case "click":
        return (
          <>
            <Form.Item
              name="selector"
              label="选择器"
              rules={[{ required: true, message: "请输入选择器" }]}
            >
              <Input placeholder="请输入选择器" />
            </Form.Item>
            <Form.Item
              name="timeout"
              label="超时时间"
              rules={[{ required: true, message: "请输入超时时间" }]}
              initialValue={60000}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="请输入时间（毫秒）"
              />
            </Form.Item>
          </>
        );
      case "fill":
        return (
          <>
            <Form.Item
              name="selector"
              label="选择器"
              rules={[{ required: true, message: "请输入选择器" }]}
            >
              <Input placeholder="请输入选择器" />
            </Form.Item>
            <Form.Item
              name="value"
              label="填充内容"
              rules={[{ required: true, message: "请输入填充内容" }]}
            >
              <Input placeholder="请输入要填充的内容" />
            </Form.Item>
            <Form.Item name="timeout" label="超时时间" initialValue={30000}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="请输入时间（毫秒）"
              />
            </Form.Item>
          </>
        );
      case "type":
        return (
          <>
            <Form.Item
              name="selector"
              label="选择器"
              rules={[{ required: true, message: "请输入选择器" }]}
            >
              <Input placeholder="请输入选择器" />
            </Form.Item>
            <Form.Item
              name="text"
              label="输入文本"
              rules={[{ required: true, message: "请输入文本" }]}
            >
              <Input placeholder="请输入要键入的文本" />
            </Form.Item>
            <Form.Item name="delay" label="按键延迟(毫秒)" initialValue={100}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="每个按键之间的延迟时间"
              />
            </Form.Item>
          </>
        );
      case "press":
        return (
          <>
            <Form.Item name="selector" label="选择器(可选)">
              <Input placeholder="请输入选择器，不填则在页面上按键" />
            </Form.Item>
            <Form.Item
              name="key"
              label="按键"
              rules={[{ required: true, message: "请输入按键" }]}
            >
              <Input placeholder="例如：Enter, Tab, ArrowDown" />
            </Form.Item>
          </>
        );
      case "hover":
        return (
          <>
            <Form.Item
              name="selector"
              label="选择器"
              rules={[{ required: true, message: "请输入选择器" }]}
            >
              <Input placeholder="请输入选择器" />
            </Form.Item>
            <Form.Item name="timeout" label="超时时间" initialValue={30000}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="请输入时间（毫秒）"
              />
            </Form.Item>
          </>
        );
      case "screenshot":
        return (
          <>
            <Form.Item name="selector" label="选择器(可选)">
              <Input placeholder="请输入选择器，不填则截取整个页面" />
            </Form.Item>
            <Form.Item
              name="path"
              label="保存路径"
              rules={[{ required: true, message: "请输入保存路径" }]}
            >
              <Input placeholder="例如：screenshots/example.png" />
            </Form.Item>
            <Form.Item
              name="fullPage"
              label="是否全页面截图"
              initialValue={false}
            >
              <Select>
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            </Form.Item>
          </>
        );
      case "evaluate":
        return (
          <Form.Item
            name="expression"
            label="执行表达式"
            rules={[{ required: true, message: "请输入表达式" }]}
          >
            <Input.TextArea placeholder="例如：document.title" rows={4} />
          </Form.Item>
        );
      case "waitForLoadState":
        return (
          <>
            <Form.Item
              name="state"
              label="加载状态"
              initialValue="load"
              rules={[{ required: true, message: "请选择加载状态" }]}
            >
              <Select>
                <Select.Option value="load">load</Select.Option>
                <Select.Option value="domcontentloaded">
                  domcontentloaded
                </Select.Option>
                <Select.Option value="networkidle">networkidle</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="timeout" label="超时时间" initialValue={30000}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="请输入时间（毫秒）"
              />
            </Form.Item>
          </>
        );
      case "selectOption":
        return (
          <>
            <Form.Item
              name="selector"
              label="选择器"
              rules={[{ required: true, message: "请输入选择器" }]}
            >
              <Input placeholder="请输入下拉框选择器" />
            </Form.Item>
            <Form.Item
              name="value"
              label="选项值"
              rules={[{ required: true, message: "请输入选项值" }]}
            >
              <Input placeholder="请输入要选择的值" />
            </Form.Item>
          </>
        );
      case "checkOrUncheck":
        return (
          <>
            <Form.Item
              name="selector"
              label="选择器"
              rules={[{ required: true, message: "请输入选择器" }]}
            >
              <Input placeholder="请输入复选框选择器" />
            </Form.Item>
            <Form.Item
              name="checked"
              label="状态"
              initialValue={true}
              rules={[{ required: true, message: "请选择状态" }]}
            >
              <Select>
                <Select.Option value={true}>选中</Select.Option>
                <Select.Option value={false}>取消选中</Select.Option>
              </Select>
            </Form.Item>
          </>
        );
      case "goBack":
      case "goForward":
        return (
          <Form.Item name="timeout" label="超时时间" initialValue={30000}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="请输入时间（毫秒）"
            />
          </Form.Item>
        );
      case "reload":
        return (
          <Form.Item name="waitUntil" label="等待条件" initialValue="load">
            <Select>
              <Select.Option value="load">load</Select.Option>
              <Select.Option value="domcontentloaded">
                domcontentloaded
              </Select.Option>
              <Select.Option value="networkidle">networkidle</Select.Option>
            </Select>
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={editingIndex !== null ? "编辑脚本" : "添加脚本"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ type: "script" }}>
        <Form.Item
          name="type"
          label="执行类型"
          rules={[{ required: true, message: "请选择执行类型" }]}
        >
          <Select placeholder="执行类型">
            {Object.entries(ScriptTypeMap).map(([key, value]) => (
              <Select.Option key={key} value={key}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item noStyle dependencies={["type"]}>
          {() => renderScriptFields()}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ScriptModal;
