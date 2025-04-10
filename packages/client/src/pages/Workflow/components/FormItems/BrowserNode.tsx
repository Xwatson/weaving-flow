import React from "react";
import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  Switch,
  Tooltip,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import ScriptTable from "./ScriptTable/index";
import { ScriptType } from "./ScriptTable/types";

interface BrowserNodeProps {
  form: FormInstance;
}

const BrowserNode: React.FC<BrowserNodeProps> = ({ form }) => {
  const renderBeforeScript = () => {
    const type = form.getFieldValue(["beforeScript", "type"]) as ScriptType;
    let items: React.ReactNode[] = [];
    switch (type) {
      case "getPageUrl":
        items = [
          <Form.Item
            label="延时获取"
            name={["beforeScript", "getPageUrlDelay"]}
            initialValue={2000}
          >
            <InputNumber
              placeholder="请输入延时时间（毫秒）"
              style={{ width: "100%" }}
            />
          </Form.Item>,
          <Form.Item
            label="运算符"
            name={["beforeScript", "operator"]}
            rules={[{ required: true, message: "请选择运算符" }]}
          >
            <Select>
              <Select.Option value="==">等于</Select.Option>
              <Select.Option value="!=">不等于</Select.Option>
              <Select.Option value="includes">包含</Select.Option>
            </Select>
          </Form.Item>,
          <Form.Item
            label="值"
            name={["beforeScript", "value"]}
            rules={[{ required: true, message: "请输入值" }]}
          >
            <Input placeholder="请输入值" />
          </Form.Item>,
        ];
        break;
      case "waitForSelector":
        items = [
          <Form.Item
            label="运算符"
            name={["beforeScript", "operator"]}
            rules={[{ required: true, message: "请选择运算符" }]}
          >
            <Select>
              <Select.Option value="true">true</Select.Option>
              <Select.Option value="false">false</Select.Option>
            </Select>
          </Form.Item>,
        ];
        break;
      default:
        break;
    }
    if (!type) {
      return null;
    }
    return (
      <>
        {items}
        <p>采取措施（条件成立才会执行）：</p>
        <Form.Item
          label="操作"
          name={["beforeScript", "action"]}
          rules={[{ required: true, message: "请选择采取措施" }]}
        >
          <Select>
            <Select.Option value="waitTime">等待时间</Select.Option>
            <Select.Option value="waitSelector">等待选择器</Select.Option>
            <Select.Option value="continue">继续</Select.Option>
            <Select.Option value="break">停止</Select.Option>
            <Select.Option value="jumpIndex">跳转到脚本索引</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {() => {
            const action = form.getFieldValue(["beforeScript", "action"]);
            switch (action) {
              case "waitTime":
                return (
                  <Form.Item
                    label="等待时间（时间结束后将继续执行脚本）"
                    name={["beforeScript", "actionWaitTime"]}
                    rules={[{ required: true, message: "请输入时间（毫秒）" }]}
                  >
                    <InputNumber
                      placeholder="请输入时间（毫秒）"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                );
              case "waitSelector":
                return (
                  <Form.Item
                    label="等待选择器（获取到选择器后将继续执行脚本）"
                    name={["beforeScript", "actionWaitSelector"]}
                    rules={[{ required: true, message: "请输入等待选择器" }]}
                  >
                    <Input placeholder="请输入等待选择器" />
                  </Form.Item>
                );
              case "jumpIndex":
                return (
                  <Form.Item
                    label="索引（跳转到脚本索引位置继续执行）"
                    name={["beforeScript", "actionJumpIndex"]}
                    rules={[{ required: true, message: "请输入索引" }]}
                  >
                    <InputNumber style={{ width: "100%" }} min={0} max={9999} />
                  </Form.Item>
                );
              default:
                break;
            }
            return null;
          }}
        </Form.Item>
        <Form.Item
          label="是否发送通知"
          name={["beforeScript", "sendNotification"]}
          rules={[{ required: true, message: "请选择是否发送通知" }]}
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </>
    );
  };

  return (
    <>
      <Form.Item label="URL" name="url" rules={[{ required: true }]}>
        <Input placeholder="请输入URL" />
      </Form.Item>
      <p style={{ border: "1px dashed #5470FF", padding: "8px 16px" }}>
        <span
          style={{ paddingRight: 4, paddingBottom: 8, display: "inline-block" }}
        >
          执行前判断：
          <Tooltip placement="top" title={"每执行一段脚本前的条件判断"}>
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
        <Form.Item label="判断类型" name={["beforeScript", "type"]}>
          <Select
            onChange={() => {
              form.setFieldValue(["beforeScript", "operator"], "");
              form.setFieldValue(["beforeScript", "value"], "");
              form.setFieldValue(["beforeScript", "action"], "");
            }}
          >
            <Select.Option value="">无</Select.Option>
            <Select.Option value="getPageUrl">页面URL</Select.Option>
            <Select.Option value="waitForSelector">等待选择器</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {() => renderBeforeScript()}
        </Form.Item>
      </p>
      <p>
        <span
          style={{ paddingRight: 4, paddingBottom: 8, display: "inline-block" }}
        >
          执行脚本
        </span>
        <Tooltip
          placement="top"
          title={
            <>
              1.每段脚本按顺序执行
              <br />
              2.每段脚本执行结果存储在 results 数组中（仅脚本），使用：
              <br />
              <span
                dangerouslySetInnerHTML={{ __html: "xxx脚本${results[0]}" }}
              ></span>
              <br />
              <span
                dangerouslySetInnerHTML={{ __html: "xxx脚本${results[1]}" }}
              ></span>
            </>
          }
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </p>
      <Form.Item shouldUpdate>
        {() => (
          <ScriptTable form={form} scripts={form.getFieldValue("scripts")} />
        )}
      </Form.Item>
      <Form.Item label="窗口宽度" name="width">
        <InputNumber min={800} max={1920} defaultValue={1280} />
      </Form.Item>
      <Form.Item label="窗口高度" name="height">
        <InputNumber min={600} max={1080} defaultValue={800} />
      </Form.Item>
      <Form.Item label="显示浏览器" name="visible" valuePropName="checked">
        <Switch defaultChecked />
      </Form.Item>
      <Form.Item
        label="User-Agent"
        name="userAgent"
        initialValue={
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
      >
        <Input placeholder="自定义User-Agent" />
      </Form.Item>
    </>
  );
};

export default BrowserNode;
